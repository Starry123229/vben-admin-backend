package com.vben.backend.module.auth.dto;

import lombok.Data;

/**
 * 手机号登录请求体。
 *
 * @author Starry
 */
@Data
public class PhoneLoginRequest {

    private String phone;

    private String code;
}