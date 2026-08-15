package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户领域服务：用户查询与角色编码。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysUserService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;

    /** 按ID查询用户 */
    public SysUser getById(long userId) {
        return userMapper.selectById(userId);
    }

    /** 用户角色编码列表（仅启用角色） */
    public List<String> getRoleCodes(long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId)).stream()
                .map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                        .in(SysRole::getId, roleIds)
                        .eq(SysRole::getStatus, 1)).stream()
                .map(SysRole::getCode).toList();
    }
}
