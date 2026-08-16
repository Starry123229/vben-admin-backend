package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.dto.MenuSaveRequest;
import com.vben.backend.module.system.entity.SysMenu;
import com.vben.backend.module.system.entity.SysRoleMenu;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMenuMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 菜单领域服务：按角色组装前端路由树 + 管理端 CRUD。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysMenuService {

    private final SysMenuMapper menuMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final ObjectMapper objectMapper;

    /**
     * 用户可访问的路由树（契约 §3.6）：
     * 授权菜单（button 型除外）→ 按 pid 组树 → sort 升序 → meta 字符串转对象。
     * 此处契约要求 meta 为对象，必须解析。
     */
    public List<Map<String, Object>> buildRoutesByUserId(long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId)).stream()
                .map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        List<Long> menuIds = roleMenuMapper.selectList(new LambdaQueryWrapper<SysRoleMenu>()
                        .in(SysRoleMenu::getRoleId, roleIds)).stream()
                .map(SysRoleMenu::getMenuId).distinct().toList();
        if (menuIds.isEmpty()) {
            return List.of();
        }
        List<SysMenu> menus = menuMapper.selectList(new LambdaQueryWrapper<SysMenu>()
                .in(SysMenu::getId, menuIds)
                .ne(SysMenu::getType, "button")
                .eq(SysMenu::getStatus, 1));
        return buildTree(0L, menus);
    }

    /** 菜单列表（扁平，管理页使用，含按钮型） */
    public List<SysMenu> listAll() {
        return menuMapper.selectList(new LambdaQueryWrapper<SysMenu>().orderByAsc(SysMenu::getSort));
    }

    /** 菜单树（管理页权限分配勾选使用，meta 解析为对象） */
    public List<Map<String, Object>> tree() {
        List<SysMenu> menus = menuMapper.selectList(new LambdaQueryWrapper<SysMenu>()
                .ne(SysMenu::getType, "button").orderByAsc(SysMenu::getSort));
        return buildTree(0L, menus);
    }

    /** 新建菜单 */
    @Transactional
    public Long create(MenuSaveRequest req) {
        if (!StringUtils.hasText(req.getName())) {
            throw ServiceException.badRequest("菜单名称不能为空");
        }
        if (!StringUtils.hasText(req.getType())) {
            throw ServiceException.badRequest("菜单类型不能为空");
        }
        SysMenu menu = toEntity(req, null);
        menu.setCreateTime(LocalDateTime.now());
        menu.setUpdateTime(LocalDateTime.now());
        menuMapper.insert(menu);
        return menu.getId();
    }

    /** 更新菜单 */
    @Transactional
    public void update(MenuSaveRequest req) {
        if (req.getId() == null) {
            throw ServiceException.badRequest("菜单 ID 不能为空");
        }
        SysMenu menu = menuMapper.selectById(req.getId());
        if (menu == null) {
            throw ServiceException.badRequest("菜单不存在");
        }
        menuMapper.updateById(toEntity(req, menu));
    }

    /** 删除菜单：有子节点则拒绝 */
    @Transactional
    public void remove(Long id) {
        long children = menuMapper.selectCount(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getPid, id));
        if (children > 0) {
            throw ServiceException.badRequest("该菜单存在子节点，无法删除");
        }
        menuMapper.deleteById(id);
    }

    /** 菜单名是否存在（排除指定 ID，用于唯一性校验） */
    public boolean nameExists(String name, Long excludeId) {
        LambdaQueryWrapper<SysMenu> w = new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getName, name);
        if (excludeId != null) {
            w.ne(SysMenu::getId, excludeId);
        }
        return menuMapper.selectCount(w) > 0;
    }

    /** 菜单路径是否存在（排除指定 ID，用于唯一性校验） */
    public boolean pathExists(String path, Long excludeId) {
        LambdaQueryWrapper<SysMenu> w = new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getPath, path);
        if (excludeId != null) {
            w.ne(SysMenu::getId, excludeId);
        }
        return menuMapper.selectCount(w) > 0;
    }

    // ----------------------------------------------------------------- 私有方法

    /** 递归组树：同层按 sort 升序 */
    private List<Map<String, Object>> buildTree(long pid, List<SysMenu> menus) {
        return menus.stream()
                .filter(m -> m.getPid() != null && m.getPid() == pid)
                .sorted(Comparator.comparingInt(m -> m.getSort() == null ? 0 : m.getSort()))
                .map(menu -> toNode(menu, menus))
                .toList();
    }

    /** 实体 → 前端节点（meta 解析为对象；null 字段不输出） */
    private Map<String, Object> toNode(SysMenu menu, List<SysMenu> menus) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", menu.getId());
        node.put("name", menu.getName());
        node.put("path", menu.getPath());
        putIfNotNull(node, "component", menu.getComponent());
        putIfNotNull(node, "redirect", menu.getRedirect());
        node.put("type", menu.getType());
        putIfNotNull(node, "authCode", menu.getAuthCode());
        putIfNotNull(node, "icon", menu.getIcon());
        node.put("status", menu.getStatus());
        node.put("sort", menu.getSort());
        putIfNotNull(node, "meta", parseMeta(menu.getMeta()));
        List<Map<String, Object>> children = buildTree(menu.getId(), menus);
        if (!children.isEmpty()) {
            node.put("children", children);
        }
        return node;
    }

    /** 请求体 → 实体（existing 为 null 时新建） */
    private SysMenu toEntity(MenuSaveRequest req, SysMenu existing) {
        SysMenu menu = existing == null ? new SysMenu() : existing;
        if (req.getPid() != null) {
            menu.setPid(req.getPid());
        }
        if (StringUtils.hasText(req.getName())) {
            menu.setName(req.getName());
        }
        if (StringUtils.hasText(req.getType())) {
            menu.setType(req.getType());
        }
        menu.setPath(req.getPath());
        menu.setComponent(req.getComponent());
        menu.setRedirect(req.getRedirect());
        menu.setAuthCode(req.getAuthCode());
        menu.setIcon(req.getIcon());
        if (req.getStatus() != null) {
            menu.setStatus(req.getStatus());
        }
        if (req.getSort() != null) {
            menu.setSort(req.getSort());
        }
        menu.setMeta(req.getMeta());
        menu.setUpdateTime(LocalDateTime.now());
        return menu;
    }

    /** meta JSON 字符串 → Map（解析失败返回 null，保持与原契约一致） */
    private Map<String, Object> parseMeta(String meta) {
        if (meta == null || meta.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(meta, new TypeReference<>() {});
        } catch (Exception e) {
            return null;
        }
    }

    private void putIfNotNull(Map<String, Object> node, String key, Object value) {
        if (value != null) {
            node.put(key, value);
        }
    }
}
