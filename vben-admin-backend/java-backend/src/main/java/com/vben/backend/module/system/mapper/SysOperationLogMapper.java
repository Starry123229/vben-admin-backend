package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysOperationLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 操作日志 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysOperationLogMapper extends BaseMapper<SysOperationLog> {
}
