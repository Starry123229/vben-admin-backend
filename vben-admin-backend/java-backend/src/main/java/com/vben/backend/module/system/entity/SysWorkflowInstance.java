package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流实例（审批申请记录）。
 *
 * @author Starry
 */
@Data
@TableName("sys_workflow_instance")
public class SysWorkflowInstance {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工作流定义 ID */
    private Long workflowId;

    /** 流程名称（冗余） */
    private String workflowName;

    /** 申请人用户 ID */
    private Long applicantId;

    /** 申请人用户名 */
    private String applicantName;

    /** 申请标题 */
    private String title;

    /** 申请内容/原因 */
    private String content;

    /** 当前审批步骤（从 0 开始） */
    private Integer currentStep;

    /** 总审批步骤数 */
    private Integer totalSteps;

    /** 状态：pending=审批中, approved=已通过, rejected=已驳回, cancelled=已撤回 */
    private String status;

    /** 业务类型（如 leave=请假, purchase=采购） */
    private String bizType;

    /** 业务 ID */
    private String bizId;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 完成时间 */
    private LocalDateTime finishTime;
}
