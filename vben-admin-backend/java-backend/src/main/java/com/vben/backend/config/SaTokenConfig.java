package com.vben.backend.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 拦截器：除白名单外全部要求登录，并实时校验用户启用状态。
 * 被禁用用户即使持有旧 token，访问受保护接口也会被登出并拒绝（403）。
 *
 * @author Starry
 */
@Configuration
@RequiredArgsConstructor
public class SaTokenConfig implements WebMvcConfigurer {

    private final SysUserMapper userMapper;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> {
            StpUtil.checkLogin();
            SysUser user = userMapper.selectById(StpUtil.getLoginIdAsLong());
            if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
                StpUtil.logout();
                throw ServiceException.forbidden("该账号已被禁用，请联系管理员");
            }
        }))
                .addPathPatterns("/**")
                // 登录前可访问的白名单：核心认证 + 登录辅助功能（注册/手机号/二维码/忘记密码/第三方OAuth）
                // 注：/auth/qr/scan 需登录态（扫码确认设备），故不列入白名单
                .excludePathPatterns("/auth/login", "/auth/refresh", "/auth/logout",
                        "/auth/register",
                        "/auth/sms/send", "/auth/phone-login",
                        "/auth/qr/create", "/auth/qr/poll",
                        "/auth/forgot/**",
                        "/auth/oauth/**",
                        "/doc.html", "/webjars/**", "/v3/api-docs/**", "/knife4j/**",
                        "/swagger-ui/**", "/swagger-resources/**", "/favicon.ico");
    }
}