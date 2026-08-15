package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysMenu;
import org.apache.ibatis.annotations.Mapper;

/**
 * 菜单 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {
}
