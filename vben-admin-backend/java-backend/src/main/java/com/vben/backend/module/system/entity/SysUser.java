package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体，对应表 sys_user。
 *
 * @author Starry
 */
@Data
@TableName("sys_user")
public class SysUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 登录名 */
    private String username;

    /** 密码哈希（BCrypt） */
    private String passwordHash;

    /** 真实姓名 */
    private String realName;

    /** 头像 URL */
    private String avatar;

    /** 登录后首页路径 */
    private String homePath;

    /** 手机号（手机号登录用） */
    private String phone;

    /** 邮箱（忘记密码用） */
    private String email;

    /** 部门 ID */
    private Long deptId;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 备注 */
    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
