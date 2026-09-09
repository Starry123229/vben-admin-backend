package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 登录日志实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_login_log")
public class SysLoginLog {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String ip;
    private String location;
    private String browser;
    private String os;
    private Integer status;
    private String message;
    private String loginType;
    private LocalDateTime createTime;
}
