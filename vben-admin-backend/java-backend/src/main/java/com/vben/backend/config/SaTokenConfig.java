package com.vben.backend.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 拦截器：除白名单外全部要求登录（未登录抛 NotLoginException → 401）。
 *
 * @author Starry
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/**")
                // login/refresh 无需 accessToken；logout 按 mock 契约恒成功
                .excludePathPatterns("/auth/login", "/auth/refresh", "/auth/logout");
    }
}
