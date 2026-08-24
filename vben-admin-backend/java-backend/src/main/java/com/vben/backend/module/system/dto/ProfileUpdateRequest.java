package com.vben.backend.module.system.dto;

import lombok.Data;

/**
 * 当前用户更新个人资料请求体（个人中心-基本设置）。
 *
 * @author Starry
 */
@Data
public class ProfileUpdateRequest {

    /** 真实姓名 */
    private String realName;

    /** 个人简介 */
    private String intro;
}
