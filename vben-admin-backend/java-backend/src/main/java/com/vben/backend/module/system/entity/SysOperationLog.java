package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 操作日志实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_operation_log")
public class SysOperationLog {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String module;
    private String description;
    private String method;
    private String requestUrl;
    private String requestMethod;
    private String requestParams;
    private String ip;
    private Integer status;
    private String errorMsg;
    private Long costTime;
    private LocalDateTime createTime;
}
