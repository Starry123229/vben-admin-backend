package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysNotice;
import org.apache.ibatis.annotations.Mapper;

/**
 * 通知消息 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysNoticeMapper extends BaseMapper<SysNotice> {
}
