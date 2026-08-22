package com.vben.backend.module.auth.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.R;
import com.vben.backend.module.auth.dto.ForgotPasswordRequest;
import com.vben.backend.module.auth.dto.LoginResult;
import com.vben.backend.module.auth.dto.PhoneLoginRequest;
import com.vben.backend.module.auth.dto.RegisterRequest;
import com.vben.backend.module.auth.dto.SendResetCodeRequest;
import com.vben.backend.module.auth.dto.SendSmsRequest;
import com.vben.backend.module.auth.service.AuthExtService;
import com.vben.backend.module.auth.service.QrSession;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 登录辅助功能接口：注册、手机号登录、二维码登录、忘记密码、第三方 OAuth。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthExtController {

    private final AuthExtService authExtService;

    /** POST /auth/register：注册并自动登录 */
    @PostMapping("/register")
    public R<LoginResult> register(@RequestBody RegisterRequest req, HttpServletResponse response) {
        String token = authExtService.register(req.getUsername(), req.getPassword(),
                req.getRealName(), req.getPhone(), req.getEmail(), response);
        return R.ok(new LoginResult(token));
    }

    // ---------------------------------------------------------------- 手机号登录

    @PostMapping("/sms/send")
    public R<Map<String, Object>> sendSms(@RequestBody SendSmsRequest req) {
        String code = authExtService.sendSmsCode(req.getPhone());
        // 开发期 mock 回显验证码便于联调；生产接入短信服务后 code 为 null
        return R.ok(Map.of("mockCode", code));
    }

    @PostMapping("/phone-login")
    public R<LoginResult> phoneLogin(@RequestBody PhoneLoginRequest req, HttpServletResponse response) {
        String token = authExtService.loginByPhone(req.getPhone(), req.getCode(), response);
        return R.ok(new LoginResult(token));
    }

    // ---------------------------------------------------------------- 二维码登录

    @GetMapping("/qr/create")
    public R<QrSession> createQr() {
        return R.ok(authExtService.createQr());
    }

    /** 已登录用户确认扫码（需 Bearer token） */
    @PostMapping("/qr/scan")
    public R<Void> scanQr(@RequestParam String ticket) {
        authExtService.scanQr(ticket);
        return R.ok();
    }

    @GetMapping("/qr/poll")
    public R<QrSession> pollQr(@RequestParam String ticket, HttpServletResponse response) {
        return R.ok(authExtService.pollQr(ticket, response));
    }

    // ---------------------------------------------------------------- 忘记密码

    @PostMapping("/forgot/send")
    public R<Map<String, Object>> sendResetCode(@RequestBody SendResetCodeRequest req) {
        String code = authExtService.sendResetCode(req.getEmail());
        return R.ok(Map.of("mockCode", code));
    }

    @PostMapping("/forgot/reset")
    public R<Void> resetPassword(@RequestBody ForgotPasswordRequest req) {
        authExtService.resetPassword(req.getEmail(), req.getCode(), req.getNewPassword());
        return R.ok();
    }

    // ---------------------------------------------------------------- 第三方 OAuth

    @GetMapping("/oauth/{provider}/url")
    public R<Map<String, String>> oauthUrl(@PathVariable String provider) {
        return R.ok(Map.of("url", authExtService.oauthUrl(provider)));
    }

    /** 第三方回调（mock 直登；生产换真实 code 换 token 流程） */
    @GetMapping("/oauth/callback/{provider}")
    public R<LoginResult> oauthCallback(@PathVariable String provider,
                                        @RequestParam(required = false) String code,
                                        HttpServletResponse response) {
        String token = authExtService.oauthCallback(provider, code, response);
        return R.ok(new LoginResult(token));
    }
}