package com.vben.backend.module.system.dto;

import lombok.Data;

/**
 * 修改密码请求体。
 *
 * @author Starry
 */
@Data
public class ChangePasswordRequest {

    /** 旧密码 */
    private String oldPassword;

    /** 新密码 */
    private String newPassword;

    /** 确认新密码 */
    private String confirmPassword;
}
