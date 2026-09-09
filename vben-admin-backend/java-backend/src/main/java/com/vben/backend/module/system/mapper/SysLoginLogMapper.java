package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysLoginLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 登录日志 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysLoginLogMapper extends BaseMapper<SysLoginLog> {
}
