package com.vben.backend.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Map;

/**
 * Sa-Token 拦截器：除白名单外全部要求登录，并实时校验用户启用状态。
 * 被禁用用户即使持有旧 token，访问受保护接口也会被登出并拒绝（403）。
 *
 * <p>用户信息缓存到 Redis（TTL 5 分钟），减少每请求 DB 查询。
 * 用户状态变更时由 SysUserService 主动清除缓存。
 *
 * @author Starry
 */
@Configuration
@RequiredArgsConstructor
public class SaTokenConfig implements WebMvcConfigurer {

    private final SysUserMapper userMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            StpUtil.checkLogin();
            long userId = StpUtil.getLoginIdAsLong();

            // Sa-Token 账号封禁校验：被封禁用户即使持有旧 token 也立即拒绝
            StpUtil.checkDisable(userId);

            String cacheKey = "vben:user:info:" + userId;

            // 先查 Redis 缓存
            String cached = stringRedisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = objectMapper.readValue(cached, Map.class);
                Object status = map.get("status");
                if (status instanceof Number n && n.intValue() == 0) {
                    StpUtil.logout();
                    throw ServiceException.forbidden("该账号已被禁用，请联系管理员");
                }
                return;
            }

            // 缓存未命中，查 DB
            SysUser user = userMapper.selectById(userId);
            if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
                StpUtil.logout();
                throw ServiceException.forbidden("该账号已被禁用，请联系管理员");
            }

            // 写入缓存（手动 JSON 序列化，以 String 存入 Redis）
            Map<String, Object> userMap = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername() != null ? user.getUsername() : "",
                    "status", user.getStatus() != null ? user.getStatus() : 1
            );
            String json = objectMapper.writeValueAsString(userMap);
            stringRedisTemplate.opsForValue().set(cacheKey, json, Duration.ofMinutes(5));
        }))
                .addPathPatterns("/**")
                // 登录前可访问的白名单：核心认证 + 登录辅助功能（注册/手机号/二维码/忘记密码/第三方OAuth）
                // 注：/auth/qr/scan 需登录态（扫码确认设备），故不列入白名单
                .excludePathPatterns("/auth/login", "/auth/refresh", "/auth/logout",
                        "/auth/config",
                        "/auth/register",
                        "/auth/sms/send", "/auth/phone-login",
                        "/auth/qr/create", "/auth/qr/poll",
                        "/auth/forgot/**",
                        "/auth/oauth/**",
                        "/avatar/*.svg", "/avatar/file/**",
                        "/doc.html", "/webjars/**", "/v3/api-docs/**", "/knife4j/**",
                        "/swagger-ui/**", "/swagger-resources/**", "/favicon.ico");
    }
}
