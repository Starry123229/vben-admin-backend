package com.vben.backend.module.auth.dto;

import lombok.Data;

/**
 * 注册请求体。
 *
 * @author Starry
 */
@Data
public class RegisterRequest {

    private String username;

    private String password;

    private String realName;

    /** 手机号（可选） */
    private String phone;

    /** 邮箱（可选，用于忘记密码） */
    private String email;
}