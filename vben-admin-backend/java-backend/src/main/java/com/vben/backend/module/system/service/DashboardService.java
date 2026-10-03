package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysDeptMapper;
import com.vben.backend.module.system.mapper.SysLoginLogMapper;
import com.vben.backend.module.system.mapper.SysMenuMapper;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘统计服务：提供用户、角色、部门、菜单等维度统计数据。
 *
 * <p>所有已登录用户均可访问，统计结果中按用户角色权限做适度过滤。</p>
 * <p>优化：所有聚合统计下推到 SQL 层，消除 N+1 查询。</p>
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
     * 优化：SQL GROUP BY 替代全表加载到内存。
     */
    public List<Map<String, Object>> userTrends() {
        List<Map<String, Object>> dbData = userMapper.countByMonth();
        // 转为 Map 便于快速查找
        java.util.Map<String, Integer> monthlyCount = new HashMap<>();
        for (Map<String, Object> row : dbData) {
            String month = (String) row.get("month");
            Number count = (Number) row.get("cnt");
            monthlyCount.put(month, count != null ? count.intValue() : 0);
        }
        // 补齐最近 12 个月（无数据的月份填 0），保证折线图正常展示
        java.time.YearMonth now = java.time.YearMonth.now();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            String month = now.minusMonths(i).toString();
            Map<String, Object> item = new HashMap<>();
            item.put("month", month);
            item.put("count", monthlyCount.getOrDefault(month, 0));
            result.add(item);
        }
        return result;
    }

    /**
     * 角色分布统计：每个角色下的用户数。
     * 优化：单次 JOIN + GROUP BY 替代 N 次 COUNT 查询。
     */
    public List<Map<String, Object>> roleDistribution() {
        List<Map<String, Object>> dbData = userRoleMapper.countByRole();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : dbData) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row.get("roleName"));
            Number count = (Number) row.get("cnt");
            item.put("value", count != null ? count.intValue() : 0);
            result.add(item);
        }
        return result;
    }

    /**
     * 部门用户分布：每个部门下的用户数。
     * 优化：单次 JOIN + GROUP BY 替代 N 次 COUNT 查询。
     */
    public List<Map<String, Object>> deptDistribution() {
        List<Map<String, Object>> dbData = userMapper.countByDept();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : dbData) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row.get("deptName"));
            Number count = (Number) row.get("cnt");
            item.put("value", count != null ? count.intValue() : 0);
            result.add(item);
        }
        return result;
    }

    /**
     * 浏览器分布统计：按登录日志中的浏览器分组计数。
     * 优化：SQL GROUP BY 替代全表加载到内存。
     */
    public List<Map<String, Object>> browserDistribution() {
        List<Map<String, Object>> dbData = loginLogMapper.countByBrowser();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : dbData) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row.get("browser"));
            Number count = (Number) row.get("cnt");
            item.put("value", count != null ? count.intValue() : 0);
            result.add(item);
        }
        return result;
    }
}
