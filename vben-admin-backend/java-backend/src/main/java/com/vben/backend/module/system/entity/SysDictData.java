package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_dict_data")
public class SysDictData {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long typeId;
    private String label;
    private String value;
    private Integer sort;
    private Integer status;
    private String cssClass;
    private String remark;
    private LocalDateTime createTime;
}
