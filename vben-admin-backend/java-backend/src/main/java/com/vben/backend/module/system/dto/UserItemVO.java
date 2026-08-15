package com.vben.backend.module.system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户列表项（脱敏：不含密码哈希），用于用户管理表格。
 *
 * @author Starry
 */
@Data
public class UserItemVO {

    private Long id;
    private String username;
    private String realName;
    private String avatar;
    private String homePath;
    private Long deptId;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;

    /** 关联角色 ID 列表 */
    private List<Long> roleIds;

    /** 关联角色编码列表 */
    private List<String> roleCodes;
}
