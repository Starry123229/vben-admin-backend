package com.vben.backend.module.auth.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.R;
import com.vben.backend.config.LoginMethodsProperties;
import com.vben.backend.module.auth.dto.LoginRequest;
import com.vben.backend.module.auth.dto.LoginResult;
import com.vben.backend.module.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 认证接口（契约 §3）。
 *
 * @author Starry
 */
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LoginMethodsProperties loginMethods;

    /** GET /auth/config：登录方式开关（公开，登录页据此显隐手机/扫码/注册/第三方入口） */
    @GetMapping("/auth/config")
    public R<Map<String, Object>> config() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("account", loginMethods.isAccount());
        data.put("phone", loginMethods.isPhone());
        data.put("qrcode", loginMethods.isQrcode());
        data.put("register", loginMethods.isRegister());
        data.put("oauth", loginMethods.isOauth());
        return R.ok(data);
    }

    /** POST /auth/login：登录成功返回 accessToken（refreshToken 走 Cookie） */
    @PostMapping("/auth/login")
    public R<LoginResult> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        String accessToken = authService.login(request.getUsername(), request.getPassword(), response);
        return R.ok(new LoginResult(accessToken));
    }

    /**
     * POST /auth/refresh：契约要求成功时返回裸 accessToken 字符串（text/plain），
     * 失败返回 403 + 包裹体。前端用裸客户端读取 resp.data。
     */
    @PostMapping(value = "/auth/refresh", produces = MediaType.TEXT_PLAIN_VALUE)
    public String refresh(HttpServletRequest request, HttpServletResponse response) {
        return authService.refresh(request, response);
    }

    /** POST /auth/logout：清 Cookie + 作废令牌，恒成功 */
    @PostMapping("/auth/logout")
    public R<String> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return R.ok("");
    }

    /** GET /auth/codes：当前用户按钮权限码 */
    @GetMapping("/auth/codes")
    public R<List<String>> codes() {
        long userId = StpUtil.getLoginIdAsLong();
        return R.ok(authService.getCodes(userId));
    }
}
