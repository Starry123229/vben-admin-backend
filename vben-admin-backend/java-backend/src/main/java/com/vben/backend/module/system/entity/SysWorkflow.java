package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流定义实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_workflow")
public class SysWorkflow {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 流程名称 */
    private String name;

    /** 流程编码 */
    private String code;

    /** 流程类型（如 approval=审批, notify=知会） */
    private String type;

    /** 流程定义（JSON 格式审批链） */
    private String definition;

    /** 状态：0=禁用, 1=启用 */
    private Integer status;

    /** 备注 */
    private String remark;

    /** 创建时间 */
    private LocalDateTime createTime;
}
