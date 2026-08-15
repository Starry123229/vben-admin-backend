package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.system.entity.SysMenu;
import com.vben.backend.module.system.entity.SysRoleMenu;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMenuMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 菜单领域服务：按角色组装前端路由树。
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

    /** 递归组树：同层按 sort 升序 */
    private List<Map<String, Object>> buildTree(long pid, List<SysMenu> menus) {
        return menus.stream()
                .filter(m -> m.getPid() != null && m.getPid() == pid)
                .sorted(Comparator.comparingInt(m -> m.getSort() == null ? 0 : m.getSort()))
                .map(menu -> toNode(menu, menus))
                .toList();
    }

    /** 实体 → 前端路由节点（null 字段不输出） */
    private Map<String, Object> toNode(SysMenu menu, List<SysMenu> menus) {
        Map<String, Object> node = new HashMap<>();
        node.put("name", menu.getName());
        node.put("path", menu.getPath());
        putIfNotNull(node, "component", menu.getComponent());
        putIfNotNull(node, "redirect", menu.getRedirect());
        putIfNotNull(node, "meta", parseMeta(menu.getMeta()));
        List<Map<String, Object>> children = buildTree(menu.getId(), menus);
        if (!children.isEmpty()) {
            node.put("children", children);
        }
        return node;
    }

    /** meta JSON 字符串 → Map，非法/空值返回 null */
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
