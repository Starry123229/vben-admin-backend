package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.dto.AssignMenuRequest;
import com.vben.backend.module.system.dto.RoleSaveRequest;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysRoleMenu;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysRoleMenuMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色领域服务：角色 CRUD 与菜单（权限）分配。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysRoleService {

    private final SysRoleMapper roleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final SysUserRoleMapper userRoleMapper;

    /** 角色分页列表 */
    public PageResult<SysRole> listRoles(int page, int pageSize, String name) {
        LambdaQueryWrapper<SysRole> w = new LambdaQueryWrapper<SysRole>().orderByDesc(SysRole::getId);
        if (StringUtils.hasText(name)) {
            w.like(SysRole::getName, name);
        }
        IPage<SysRole> p = roleMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    /** 新建角色 */
    @Transactional
    public Long createRole(RoleSaveRequest req) {
        if (!StringUtils.hasText(req.getName())) {
            throw ServiceException.badRequest("角色名称不能为空");
        }
        if (!StringUtils.hasText(req.getCode())) {
            throw ServiceException.badRequest("角色编码不能为空");
        }
        long dup = roleMapper.selectCount(new LambdaQueryWrapper<SysRole>().eq(SysRole::getCode, req.getCode()));
        if (dup > 0) {
            throw ServiceException.badRequest("角色编码已存在");
        }
        SysRole role = new SysRole();
        role.setName(req.getName());
        role.setCode(req.getCode());
        role.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        role.setRemark(req.getRemark());
        role.setCreateTime(LocalDateTime.now());
        roleMapper.insert(role);
        return role.getId();
    }

    /** 更新角色 */
    @Transactional
    public void updateRole(RoleSaveRequest req) {
        if (req.getId() == null) {
            throw ServiceException.badRequest("角色 ID 不能为空");
        }
        SysRole role = roleMapper.selectById(req.getId());
        if (role == null) {
            throw ServiceException.badRequest("角色不存在");
        }
        if (StringUtils.hasText(req.getName())) {
            role.setName(req.getName());
        }
        if (StringUtils.hasText(req.getCode())) {
            long dup = roleMapper.selectCount(new LambdaQueryWrapper<SysRole>()
                    .eq(SysRole::getCode, req.getCode()).ne(SysRole::getId, req.getId()));
            if (dup > 0) {
                throw ServiceException.badRequest("角色编码已存在");
            }
            role.setCode(req.getCode());
        }
        if (req.getStatus() != null) {
            role.setStatus(req.getStatus());
        }
        role.setRemark(req.getRemark());
        roleMapper.updateById(role);
    }

    /** 删除角色：禁止删除 super，并级联清理关联 */
    @Transactional
    public void deleteRole(Long id) {
        if (id == null) {
            throw ServiceException.badRequest("角色 ID 不能为空");
        }
        SysRole role = roleMapper.selectById(id);
        if (role == null) {
            throw ServiceException.badRequest("角色不存在");
        }
        if ("super".equals(role.getCode())) {
            throw ServiceException.badRequest("超级管理员角色不可删除");
        }
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, id));
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getRoleId, id));
        roleMapper.deleteById(id);
    }

    /** 查询角色已分配的菜单 ID 列表 */
    public List<Long> getMenuIds(Long roleId) {
        return roleMenuMapper.selectList(new LambdaQueryWrapper<SysRoleMenu>()
                        .eq(SysRoleMenu::getRoleId, roleId)).stream()
                .map(SysRoleMenu::getMenuId).toList();
    }

    /** 重新分配角色菜单（全量替换） */
    @Transactional
    public void assignMenus(Long roleId, AssignMenuRequest req) {
        if (roleId == null) {
            throw ServiceException.badRequest("角色 ID 不能为空");
        }
        SysRole role = roleMapper.selectById(roleId);
        if (role == null) {
            throw ServiceException.badRequest("角色不存在");
        }
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, roleId));
        if (req.getMenuIds() != null) {
            for (Long menuId : req.getMenuIds()) {
                SysRoleMenu rm = new SysRoleMenu();
                rm.setRoleId(roleId);
                rm.setMenuId(menuId);
                roleMenuMapper.insert(rm);
            }
        }
    }
}
