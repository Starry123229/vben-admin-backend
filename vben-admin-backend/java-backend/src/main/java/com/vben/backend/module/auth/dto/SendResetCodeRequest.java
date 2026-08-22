package com.vben.backend.module.auth.dto;

import lombok.Data;

/**
 * 发送忘记密码验证码请求体。
 *
 * @author Starry
 */
@Data
public class SendResetCodeRequest {

    private String email;
}