package com.vben.backend.module.system.dto;

import lombok.Data;

/**
 * 角色保存（新建/更新）请求体。
 *
 * @author Starry
 */
@Data
public class RoleSaveRequest {

    /** 角色 ID（更新时必填，新建时忽略） */
    private Long id;

    /** 角色名称 */
    private String name;

    /** 角色编码（super/admin/user 等，唯一） */
    private String code;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 备注 */
    private String remark;
}
