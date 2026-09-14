package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 站内信实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_message")
public class SysMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 接收人用户 ID（0=全员广播） */
    private Long userId;

    /** 发送人用户 ID（0=系统消息） */
    private Long senderId;

    /** 消息标题 */
    private String title;

    /** 消息内容 */
    private String content;

    /** 消息类型：notice=通知, alert=告警, task=任务 */
    private String type;

    /** 业务关联 ID（可选） */
    private String bizId;

    /** 是否已读：0=未读, 1=已读 */
    private Integer isRead;

    /** 创建时间 */
    private LocalDateTime createTime;
}
