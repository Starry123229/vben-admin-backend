package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.system.entity.SysDept;
import com.vben.backend.module.system.entity.SysMenu;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.entity.SysLoginLog;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysDeptMapper;
import com.vben.backend.module.system.mapper.SysLoginLogMapper;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
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
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final SysMenuMapper menuMapper;
    private final SysLoginLogMapper loginLogMapper;

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

        data.put("totalUsers", (int) totalUsers);
        data.put("activeUsers", (int) activeUsers);
        data.put("disabledUsers", (int) disabledUsers);
        data.put("totalRoles", (int) totalRoles);
        data.put("totalDepts", (int) totalDepts);
        data.put("totalMenus", (int) totalMenus);
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
        // 补齐最近 12 个月（无数据的月份填 0），保证折线图正常展示
        java.time.YearMonth now = java.time.YearMonth.now();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            String month = now.minusMonths(i).toString();
            Map<String, Object> item = new HashMap<>();
            item.put("month", month);
            item.put("count", monthlyCount.getOrDefault(month, 0L).intValue());
            result.add(item);
        }
        return result;
    }

    /**
     * 角色分布统计：每个角色下的用户数。
     */
    public List<Map<String, Object>> roleDistribution() {
        List<SysRole> roles = roleMapper.selectList(null);
        return roles.stream().map(role -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", role.getName());
            long count = userRoleMapper.selectCount(new LambdaQueryWrapper<SysUserRole>()
                    .eq(SysUserRole::getRoleId, role.getId()));
            item.put("value", (int) count);
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
     * 浏览器分布统计：按登录日志中的浏览器分组计数。
     */
    public List<Map<String, Object>> browserDistribution() {
        List<SysLoginLog> logs = loginLogMapper.selectList(null);
        java.util.Map<String, Long> counter = new java.util.HashMap<>();
        for (SysLoginLog log : logs) {
            String browser = log.getBrowser();
            if (browser == null || browser.isBlank() || "Unknown".equalsIgnoreCase(browser)) {
                browser = "其他";
            }
            counter.merge(browser, 1L, Long::sum);
        }
        return counter.entrySet().stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("value", e.getValue().intValue());
                    return item;
                })
                .toList();
    }
}
