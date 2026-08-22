package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知消息实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_notice")
public class SysNotice {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String message;
    private String avatar;
    private String link;
    private Integer isRead;
    private Long userId;
    private Long roleId;
    private String type;
    private LocalDateTime createTime;
}
