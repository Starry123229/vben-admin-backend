package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流审批记录（每一步的审批意见）。
 *
 * @author Starry
 */
@Data
@TableName("sys_workflow_task")
public class SysWorkflowTask {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工作流实例 ID */
    private Long instanceId;

    /** 审批步骤序号 */
    private Integer step;

    /** 审批人用户 ID */
    private Long approverId;

    /** 审批人用户名 */
    private String approverName;

    /** 审批动作：approve=通过, reject=驳回 */
    private String action;

    /** 审批意见 */
    private String comment;

    /** 审批时间 */
    private LocalDateTime approveTime;
}
