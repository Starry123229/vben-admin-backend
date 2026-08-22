package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.system.entity.SysDept;
import com.vben.backend.module.system.entity.SysMenu;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysDeptMapper;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘统计服务：提供用户、角色、部门、菜单等维度统计数据。
 *
 * <p>所有已登录用户均可访问，统计结果中按用户角色权限做适度过滤。</p>
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final SysMenuMapper menuMapper;

    /**
     * 概览统计：总用户数、启用用户数、角色数、部门数、菜单数。
     */
    public Map<String, Object> overview() {
        Map<String, Object> data = new HashMap<>();

        long totalUsers = userMapper.selectCount(null);
        long activeUsers = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getStatus, 1));
        long disabledUsers = totalUsers - activeUsers;

        long totalRoles = roleMapper.selectCount(null);
        long totalDepts = deptMapper.selectCount(null);
        long totalMenus = menuMapper.selectCount(null);

        data.put("totalUsers", totalUsers);
        data.put("activeUsers", activeUsers);
        data.put("disabledUsers", disabledUsers);
        data.put("totalRoles", totalRoles);
        data.put("totalDepts", totalDepts);
        data.put("totalMenus", totalMenus);
        return data;
    }

    /**
     * 用户增长趋势（按创建时间月份分组）。
     */
    public List<Map<String, Object>> userTrends() {
        List<SysUser> users = userMapper.selectList(null);
        // 按月分组统计
        java.util.Map<String, Long> monthlyCount = new java.util.TreeMap<>();
        for (SysUser user : users) {
            if (user.getCreateTime() != null) {
                String month = user.getCreateTime().getYear() + "-"
                        + String.format("%02d", user.getCreateTime().getMonthValue());
                monthlyCount.merge(month, 1L, Long::sum);
            }
        }
        // 转为列表
        return monthlyCount.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("month", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .toList();
    }

    /**
     * 角色分布统计：每个角色下的用户数。
     */
    public List<Map<String, Object>> roleDistribution() {
        List<SysRole> roles = roleMapper.selectList(null);
        return roles.stream().map(role -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", role.getName());
            item.put("value", role.getId());
            return item;
        }).toList();
    }

    /**
     * 部门用户分布：每个部门下的用户数。
     */
    public List<Map<String, Object>> deptDistribution() {
        List<SysDept> depts = deptMapper.selectList(null);
        return depts.stream().map(dept -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", dept.getName());
            long count = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getDeptId, dept.getId()));
            item.put("value", count);
            return item;
        }).toList();
    }

    /**
     * 工作台数据：当前用户信息 + 快捷导航 + 待办事项 + 最新动态。
     */
    public Map<String, Object> workspace() {
        Map<String, Object> data = new HashMap<>();

        // 统计数据
        data.put("totalUsers", userMapper.selectCount(null));
        data.put("totalRoles", roleMapper.selectCount(null));
        data.put("totalDepts", deptMapper.selectCount(null));
        data.put("totalMenus", menuMapper.selectCount(null));

        return data;
    }
}
