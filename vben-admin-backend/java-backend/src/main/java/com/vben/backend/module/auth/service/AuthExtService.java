package com.vben.backend.module.auth.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 登录辅助功能：注册、手机号登录、二维码登录、忘记密码、第三方 OAuth。
 *
 * <p>外部服务（短信/邮件/第三方授权）通过配置项驱动：开发期 default mock 可全流程跑通，
 * 配置真实服务后即可切换。二维码登录为服务端内存会话，可真实闭环。</p>
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class AuthExtService {

    /** 默认注册角色：普通用户 */
    private static final long DEFAULT_ROLE_ID = 3L;

    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final AuthService authService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CodeStore codeStore;

    @Value("${vben.auth.sms-mock:true}")
    private boolean smsMock;

    @Value("${vben.auth.email-mock:true}")
    private boolean emailMock;

    /** 手机号正则（中国大陆） */
    private static final java.util.regex.Pattern PHONE_PATTERN =
            java.util.regex.Pattern.compile("^1\\d{10}$");

    // ------------------------------------------------------------------ 注册

    /** 注册：校验 → 创建用户（默认 user 角色）→ 自动登录 */
    @Transactional
    public String register(String username, String password, String realName,
                           String phone, String email, HttpServletResponse response) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw ServiceException.badRequest("用户名和密码不能为空");
        }
        if (password.length() < 6) {
            throw ServiceException.badRequest("密码长度不能少于 6 位");
        }
        if (userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username)) > 0) {
            throw ServiceException.badRequest("用户名已存在");
        }
        if (StringUtils.hasText(phone) && !PHONE_PATTERN.matcher(phone).matches()) {
            throw ServiceException.badRequest("手机号格式不正确");
        }
        if (StringUtils.hasText(phone) && userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getPhone, phone)) > 0) {
            throw ServiceException.badRequest("手机号已被占用");
        }
        SysUser user = new SysUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRealName(StringUtils.hasText(realName) ? realName : username);
        user.setPhone(StringUtils.hasText(phone) ? phone : null);
        user.setEmail(StringUtils.hasText(email) ? email : null);
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.insert(user);
        bindDefaultRole(user.getId());
        return authService.loginByUserId(user.getId(), response);
    }

    // ---------------------------------------------------------------- 手机号登录

    /** 发送短信验证码。开发期 mock 直返回验证码，生产接入短信服务后返回 null。 */
    public String sendSmsCode(String phone) {
        if (!StringUtils.hasText(phone) || !PHONE_PATTERN.matcher(phone).matches()) {
            throw ServiceException.badRequest("手机号格式不正确");
        }
        String code = codeStore.put("sms:" + phone);
        // TODO 生产：接入阿里云/腾讯云短信，用 SmsProvider 发送后 return null
        return smsMock ? code : null;
    }

    /** 手机号 + 验证码登录；用户不存在则自动注册。 */
    @Transactional
    public String loginByPhone(String phone, String code, HttpServletResponse response) {
        if (!codeStore.verify("sms:" + phone, code)) {
            throw ServiceException.badRequest("验证码错误或已过期");
        }
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getPhone, phone));
        if (user == null) {
            user = new SysUser();
            user.setUsername("u" + phone);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRealName(phone);
            user.setPhone(phone);
            user.setStatus(1);
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            userMapper.insert(user);
            bindDefaultRole(user.getId());
        }
        return authService.loginByUserId(user.getId(), response);
    }

    // ---------------------------------------------------------------- 二维码登录

    /**
     * 生成二维码登录 ticket：返回给前端渲染二维码，前端轮询 status。
     * 登录态闭环：另一台"已登录"设备扫码成功后，本机轮询到 confirmed 即取得 accessToken。
     */
    public QrSession createQr() {
        String ticket = UUID.randomUUID().toString().replace("-", "");
        QrSession session = new QrSession(ticket);
        QrSession.SESSIONS.put(ticket, session);
        return session;
    }

    /** 已登录用户扫描二维码并确认：把 ticket 与当前用户绑定。 */
    @Transactional
    public void scanQr(String ticket) {
        QrSession session = QrSession.SESSIONS.get(ticket);
        if (session == null) {
            throw ServiceException.badRequest("二维码已失效");
        }
        long userId = StpUtil.getLoginIdAsLong();
        session.setLoginUserId(userId);
        session.setStatus("confirmed");
    }

    /** 轮询二维码状态：confirmed 时返回该用户 accessToken（由前端提交 response 换 token）。 */
    public QrSession pollQr(String ticket, HttpServletResponse response) {
        QrSession session = QrSession.SESSIONS.get(ticket);
        if (session == null) {
            throw ServiceException.badRequest("二维码已失效");
        }
        if ("confirmed".equals(session.getStatus()) && session.getLoginUserId() != null) {
            // 给轮询端签发独立登录态，前端存储后注入请求头
            session.setAccessToken(authService.loginByUserId(session.getLoginUserId(), response));
        }
        return session;
    }

    // ---------------------------------------------------------------- 忘记密码

    /** 发送重置验证码到邮箱（开发期 mock 直返回验证码）。 */
    public String sendResetCode(String email) {
        if (!StringUtils.hasText(email) || !email.contains("@")) {
            throw ServiceException.badRequest("邮箱格式不正确");
        }
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getEmail, email));
        if (user == null) {
            throw ServiceException.badRequest("该邮箱未注册");
        }
        String code = codeStore.put("reset:" + email);
        // TODO 生产：接入 SMTP 邮件服务发送后 return null
        return emailMock ? code : null;
    }

    /** 校验验证码并重置密码。 */
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        if (!codeStore.verify("reset:" + email, code)) {
            throw ServiceException.badRequest("验证码错误或已过期");
        }
        if (!StringUtils.hasText(newPassword) || newPassword.length() < 6) {
            throw ServiceException.badRequest("新密码长度不能少于 6 位");
        }
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getEmail, email));
        if (user == null) {
            throw ServiceException.badRequest("该邮箱未注册");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    // ---------------------------------------------------------------- 第三方 OAuth

    /** 生成第三方授权跳转 URL（mock 模式返回本地演示地址；配置真实 appid 后跳官方授权）。 */
    public String oauthUrl(String provider) {
        String clientId = oauthClientId(provider);
        String redirectUri = oauthRedirectUri(provider);
        String authBase = switch (provider) {
            case "wechat" -> "https://open.weixin.qq.com/connect/qrconnect?appid=%s&redirect_uri=%s&response_type=code&scope=snsapi_login&state=STATE";
            case "qq" -> "https://graph.qq.com/oauth2.0/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=get_user_info&state=STATE";
            case "github" -> "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email&state=STATE";
            case "google" -> "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=email%20profile&state=STATE";
            default -> throw ServiceException.badRequest("不支持的第三方登录方式");
        };
        if (!StringUtils.hasText(clientId)) {
            // mock／未配置：返回本地演示 URL，前端点击跳转到本地回调以便走通流程
            return "/api/auth/oauth/callback/" + provider + "?mock=true&state=STATE";
        }
        return String.format(authBase, clientId, redirectUri);
    }

    /** 第三方授权回调：mock 模式用 provider 名构造临时账号登录；生产应在收到 code 后向平台换 token。 */
    @Transactional
    public String oauthCallback(String provider, String code, HttpServletResponse response) {
        if (StringUtils.hasText(oauthClientId(provider))) {
            // TODO 生产：用 code 调平台接口换用户信息，绑定本地账号
            throw ServiceException.badRequest("生产 OAuth 需配置真实平台凭证后实现");
        }
        // mock：二维码登录演示。构造/复用 provider 绑定用户
        String bindKey = "oauth_" + provider;
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, bindKey));
        if (user == null) {
            user = new SysUser();
            user.setUsername(bindKey);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRealName(provider + " 用户");
            user.setStatus(1);
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            userMapper.insert(user);
            bindDefaultRole(user.getId());
        }
        return authService.loginByUserId(user.getId(), response);
    }

    // ------------------------------------------------------------------ 私有

    private void bindDefaultRole(long userId) {
        SysUserRole ur = new SysUserRole();
        ur.setUserId(userId);
        ur.setRoleId(DEFAULT_ROLE_ID);
        userRoleMapper.insert(ur);
    }

    private String oauthClientId(String provider) {
        return System.getenv("V_BEN_OAUTH_" + provider.toUpperCase() + "_CLIENT_ID");
    }

    private String oauthRedirectUri(String provider) {
        return "http://localhost:8080/api/auth/oauth/callback/" + provider;
    }
}