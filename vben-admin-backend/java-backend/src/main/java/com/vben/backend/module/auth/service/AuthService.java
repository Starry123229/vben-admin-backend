package com.vben.backend.module.auth.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.auth.entity.SysRefreshToken;
import com.vben.backend.module.auth.mapper.SysRefreshTokenMapper;
import com.vben.backend.module.system.entity.SysMenu;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysRoleMenu;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.entity.SysLoginLog;
import com.vben.backend.module.system.mapper.SysLoginLogMapper;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysRoleMenuMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import com.vben.backend.module.system.service.SysConfigService;
import com.vben.backend.module.system.util.IpLocationUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 认证服务：双 token 方案。
 *
 * <p>accessToken：Sa-Token 原生管理（Authorization: Bearer 头，2h）。
 * refreshToken：自管随机串（SHA-256 入库、HttpOnly Cookie「jwt」下发、每次刷新轮换）。
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    /** refreshToken 的 Cookie 名，契约固定为 jwt */
    public static final String REFRESH_COOKIE = "jwt";

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final SysMenuMapper menuMapper;
    private final SysRefreshTokenMapper refreshTokenMapper;
    private final SysLoginLogMapper loginLogMapper;
    private final SysConfigService configService;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 按用户的登录失败计数与锁定（内存实现，单机部署）。
     * username -> [0]失败窗口起始毫秒 [1]窗口内失败次数 [2]锁定截止毫秒（0=未锁定）
     * 参数来自 sys_config：sys.login.max-fail-count（默认5）、sys.login.lock-minutes（默认30）。
     */
    private final Map<String, long[]> loginFailCache = new ConcurrentHashMap<>();

    @Value("${vben.auth.refresh-token-days:7}")
    private int refreshDays;

    @Value("${vben.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${vben.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    /** 登录：校验凭据 → 签发双 token（含按用户失败锁定校验） */
    public String login(String username, String password, HttpServletResponse response) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw ServiceException.badRequest("Username and password are required");
        }
        checkUserLock(username);
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username));
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            recordLoginFail(username);
            recordLoginLog(user != null ? user.getId() : null, username, getCurrentRequest(), "account", 0, "用户名或密码错误");
            throw ServiceException.forbidden("Username or password is incorrect.");
        }
        clearLoginFail(username);
        return loginByUserId(user.getId(), response);
    }

    /**
     * 校验账号是否处于锁定状态，锁定中则拒绝登录。
     */
    private void checkUserLock(String username) {
        long[] entry = loginFailCache.get(username);
        if (entry != null && entry[2] > System.currentTimeMillis()) {
            long minutesLeft = (entry[2] - System.currentTimeMillis()) / 60000L + 1;
            throw ServiceException.badRequest("失败次数过多，账号已锁定，请 " + minutesLeft + " 分钟后再试");
        }
    }

    /**
     * 记录一次登录失败：窗口内达到阈值则锁定该账号。
     */
    private void recordLoginFail(String username) {
        int maxFail = intConfig("sys.login.max-fail-count", 5);
        int lockMinutes = intConfig("sys.login.lock-minutes", 30);
        long now = System.currentTimeMillis();
        loginFailCache.compute(username, (k, v) -> {
            if (v == null || now - v[0] > 30 * 60_000L) {
                v = new long[]{now, 0, 0};
            }
            v[1]++;
            if (v[1] >= maxFail) {
                v[2] = now + lockMinutes * 60_000L;
                v[1] = 0;
                log.warn("账号 [{}] 连续登录失败达 {} 次，锁定 {} 分钟", username, maxFail, lockMinutes);
            }
            return v;
        });
    }

    /**
     * 登录成功后清除失败计数。
     */
    private void clearLoginFail(String username) {
        loginFailCache.remove(username);
    }

    private int intConfig(String key, int defVal) {
        try {
            String v = configService.getValueByKey(key);
            return v != null && !v.isBlank() ? Integer.parseInt(v.trim()) : defVal;
        } catch (Exception e) {
            return defVal;
        }
    }

    /** 按用户 ID 直接签发双 token（注册/手机号/二维码/第三方登录复用）。禁用用户阻止登录。 */
    public String loginByUserId(long userId, HttpServletResponse response) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw ServiceException.forbidden("账号不存在");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw ServiceException.forbidden("该账号已被禁用，请联系管理员");
        }
        StpUtil.login(userId);
        issueRefreshToken(userId, response);
        recordLoginLog(userId, user.getUsername(), getCurrentRequest(), "account", 1, "登录成功");
        return StpUtil.getTokenValue();
    }

    /**
     * 刷新 accessToken：校验 Cookie 中 refreshToken → 轮换新 refresh → 返回新 accessToken。
     * 契约要求本接口成功时返回裸 token 字符串。
     */
    public String refresh(HttpServletRequest request, HttpServletResponse response) {
        String token = readRefreshCookie(request);
        SysRefreshToken record = token == null ? null
                : refreshTokenMapper.selectOne(new LambdaQueryWrapper<SysRefreshToken>()
                        .eq(SysRefreshToken::getTokenHash, sha256(token)));
        boolean invalid = record == null
                || record.getRevoked() == 1
                || record.getExpiresAt().isBefore(LocalDateTime.now());
        if (invalid) {
            clearRefreshCookie(response);
            throw ServiceException.forbidden();
        }
        // 轮换：作废旧 refresh，签发新的
        record.setRevoked(1);
        refreshTokenMapper.updateById(record);
        StpUtil.login(record.getUserId());
        issueRefreshToken(record.getUserId(), response);
        return StpUtil.getTokenValue();
    }

    /** 登出：作废 refresh、清理 Cookie 与 Sa-Token 会话；按契约恒成功 */
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String token = readRefreshCookie(request);
        if (token != null) {
            SysRefreshToken record = refreshTokenMapper.selectOne(
                    new LambdaQueryWrapper<SysRefreshToken>()
                            .eq(SysRefreshToken::getTokenHash, sha256(token)));
            if (record != null) {
                record.setRevoked(1);
                refreshTokenMapper.updateById(record);
            }
        }
        clearRefreshCookie(response);
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
    }

    /** 当前用户权限码：启用角色 → 授权菜单 → 启用的 button 型 authCode。
     * 超级管理员拥有全部权限码，与 buildRoutesByUserId 的 super 逻辑保持一致。 */
    public List<String> getCodes(long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId)).stream()
                .map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        // 仅保留启用状态的角色（status=1），禁用角色的权限码不应再生效
        List<SysRole> activeRoles = roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                        .in(SysRole::getId, roleIds)
                        .eq(SysRole::getStatus, 1));
        if (activeRoles.isEmpty()) {
            return List.of();
        }
        // 超级管理员拥有全部权限码：直接返回所有启用的 button 型菜单的 authCode
        boolean isSuper = activeRoles.stream().anyMatch(r -> "super".equals(r.getCode()));
        if (isSuper) {
            return menuMapper.selectList(new LambdaQueryWrapper<SysMenu>()
                        .eq(SysMenu::getType, "button")
                        .eq(SysMenu::getStatus, 1)
                        .isNotNull(SysMenu::getAuthCode)).stream()
                .map(SysMenu::getAuthCode).distinct().toList();
        }
        List<Long> activeRoleIds = activeRoles.stream().map(SysRole::getId).toList();
        List<Long> menuIds = roleMenuMapper.selectList(new LambdaQueryWrapper<SysRoleMenu>()
                        .in(SysRoleMenu::getRoleId, activeRoleIds)).stream()
                .map(SysRoleMenu::getMenuId).toList();
        if (menuIds.isEmpty()) {
            return List.of();
        }
        return menuMapper.selectList(new LambdaQueryWrapper<SysMenu>()
                        .in(SysMenu::getId, menuIds)
                        .eq(SysMenu::getType, "button")
                        .eq(SysMenu::getStatus, 1)
                        .isNotNull(SysMenu::getAuthCode)).stream()
                .map(SysMenu::getAuthCode).distinct().toList();
    }

    /** 当前用户角色编码列表 */
    public List<String> getRoleCodes(long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId)).stream()
                .map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                        .in(SysRole::getId, roleIds)
                        .eq(SysRole::getStatus, 1)).stream()
                .map(SysRole::getCode).toList();
    }

    // ---------------------------------------------------------------------------- 私有方法

    /** 记录登录日志 */
    private void recordLoginLog(Long userId, String username, HttpServletRequest request,
                                String loginType, int status, String message) {
        try {
            SysLoginLog log = new SysLoginLog();
            log.setUserId(userId);
            log.setUsername(username);
            log.setStatus(status);
            log.setMessage(message);
            log.setLoginType(loginType);
            log.setCreateTime(LocalDateTime.now());
            // 从请求中获取 IP、浏览器、操作系统
            if (request != null) {
            log.setIp(getClientIp(request));
            log.setLocation(IpLocationUtil.getLocation(log.getIp()));
            String userAgent = request.getHeader("User-Agent");
                if (userAgent != null) {
                    log.setBrowser(parseBrowser(userAgent));
                    log.setOs(parseOs(userAgent));
                }
            }
            loginLogMapper.insert(log);
        } catch (Exception e) {
            // 日志记录失败不影响主流程
        }
    }

    /** 通过 RequestContextHolder 获取当前请求 */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    private String parseBrowser(String userAgent) {
        if (userAgent.contains("Edg/")) return "Edge";
        if (userAgent.contains("Chrome/")) return "Chrome";
        if (userAgent.contains("Firefox/")) return "Firefox";
        if (userAgent.contains("Safari/") && !userAgent.contains("Chrome")) return "Safari";
        if (userAgent.contains("MSIE") || userAgent.contains("Trident/")) return "IE";
        return "Unknown";
    }

    private String parseOs(String userAgent) {
        if (userAgent.contains("Windows NT 10")) return "Windows 10/11";
        if (userAgent.contains("Windows NT")) return "Windows";
        if (userAgent.contains("Mac OS X")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iPhone") || userAgent.contains("iPad")) return "iOS";
        return "Unknown";
    }

    /** 生成随机 refreshToken，SHA-256 入库，并写入 HttpOnly Cookie */
    private void issueRefreshToken(long userId, HttpServletResponse response) {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);

        SysRefreshToken record = new SysRefreshToken();
        record.setUserId(userId);
        record.setTokenHash(sha256(token));
        record.setExpiresAt(LocalDateTime.now().plusDays(refreshDays));
        record.setRevoked(0);
        record.setCreatedAt(LocalDateTime.now());
        refreshTokenMapper.insert(record);

        Cookie cookie = new Cookie(REFRESH_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshDays * 24L * 3600));
        // 手工拼 Set-Cookie 以支持 SameSite 属性
        response.addHeader("Set-Cookie", String.format(
                "%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=%s%s",
                REFRESH_COOKIE, token, cookie.getMaxAge(), cookieSameSite,
                cookieSecure ? "; Secure" : ""));
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", String.format(
                "%s=; Path=/; Max-Age=0; HttpOnly; SameSite=%s%s",
                REFRESH_COOKIE, cookieSameSite, cookieSecure ? "; Secure" : ""));
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
