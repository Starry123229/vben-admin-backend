package com.vben.backend.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录响应数据：契约只要求 accessToken，不返回密码等其余字段。
 *
 * @author Starry
 */
@Data
@AllArgsConstructor
public class LoginResult {

    private String accessToken;
}
