package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysUserRole;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户-角色关联 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {
}
