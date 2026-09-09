package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_job")
public class SysJob {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String groupName;
    private String invokeTarget;
    private String cron;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
}
