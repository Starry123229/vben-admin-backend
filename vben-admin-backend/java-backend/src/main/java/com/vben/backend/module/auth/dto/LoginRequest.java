package com.vben.backend.module.auth.dto;

import lombok.Data;

/**
 * 登录请求体。
 *
 * @author Starry
 */
@Data
public class LoginRequest {

    private String username;

    private String password;
}
