package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 部门实体，对应表 sys_dept。
 * 注意：sys_dept 仅有 create_time（无 update_time），实体不可加 updateTime 字段。
 *
 * @author Starry
 */
@Data
@TableName("sys_dept")
public class SysDept {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 父部门 ID（根为 0） */
    private Long pid;

    /** 部门名称 */
    private String name;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 备注 */
    private String remark;

    private LocalDateTime createTime;
}
