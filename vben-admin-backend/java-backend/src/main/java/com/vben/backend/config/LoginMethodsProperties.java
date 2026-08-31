package com.vben.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 登录方式开关（application.yml {@code vben.auth.login-methods.*}）。
 *
 * <p>单一事实来源：{@link com.vben.backend.module.auth.controller.AuthController}
 * 的 {@code GET /auth/config} 将其下发给前端控制登录页入口显隐，
 * 后端各登录辅助接口同步校验，前后端不会出现"藏了入口但接口仍开放"的缝隙。</p>
 *
 * @author Starry
 */
@Data
@Component
@ConfigurationProperties(prefix = "vben.auth.login-methods")
public class LoginMethodsProperties {

    /** 账号密码登录（核心登录方式，一般不关） */
    private boolean account = true;

    /** 手机验证码登录（含发送验证码） */
    private boolean phone = true;

    /** 扫码登录（另一台已登录设备扫码确认） */
    private boolean qrcode = true;

    /** 注册入口（页面与接口） */
    private boolean register = true;

    /** 第三方 OAuth 登录（总开关：false 时前端隐藏图标、后端拒绝授权跳转与回调） */
    private boolean oauth = false;
}
