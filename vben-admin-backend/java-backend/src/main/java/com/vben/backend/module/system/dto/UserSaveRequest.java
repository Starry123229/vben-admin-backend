package com.vben.backend.module.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 用户保存（新建/更新）请求体。
 *
 * @author Starry
 */
@Data
public class UserSaveRequest {

    /** 用户 ID（更新时必填，新建时忽略） */
    private Long id;

    /** 登录名 */
    private String username;

    /**
     * 密码（新建必填；更新时为空表示不修改密码）。
     * 明文，由服务层以 BCrypt 加密入库。
     */
    private String password;

    /** 真实姓名 */
    private String realName;

    /** 头像 URL */
    private String avatar;

    /** 登录后首页路径 */
    private String homePath;

    /** 部门 ID */
    private Long deptId;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 备注 */
    private String remark;

    /** 关联角色 ID 列表 */
    private List<Long> roleIds;
}
