package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审计日志实体：记录数据变更前后的对比。
 *
 * @author Starry
 */
@Data
@TableName("sys_audit_log")
public class SysAuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 操作人用户 ID */
    private Long userId;

    /** 操作人用户名 */
    private String username;

    /** 操作模块（如 用户管理, 角色管理） */
    private String module;

    /** 操作类型（CREATE, UPDATE, DELETE） */
    private String operation;

    /** 实体类型（如 SysUser, SysRole） */
    private String entityType;

    /** 实体 ID */
    private String entityId;

    /** 变更前数据（JSON） */
    private String oldData;

    /** 变更后数据（JSON） */
    private String newData;

    /** 变更字段摘要（如 name, status） */
    private String changedFields;

    /** 请求 IP */
    private String ip;

    /** 创建时间 */
    private LocalDateTime createTime;
}
