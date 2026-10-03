package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 用户 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 按部门统计用户数（一次查询替代 N+1）。
     * 返回 [{deptId, deptName, cnt}, ...]
     */
    @Select("""
            SELECT d.id AS deptId, d.name AS deptName, COUNT(u.id) AS cnt
            FROM sys_dept d
            LEFT JOIN sys_user u ON u.dept_id = d.id
            GROUP BY d.id, d.name
            """)
    List<Map<String, Object>> countByDept();

    /**
     * 按月份统计用户增长（SQL 层 GROUP BY 替代全表加载到内存）。
     * 返回 [{month, cnt}, ...]
     */
    @Select("""
            SELECT DATE_FORMAT(create_time, '%Y-%m') AS month, COUNT(*) AS cnt
            FROM sys_user
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(create_time, '%Y-%m')
            ORDER BY month
            """)
    List<Map<String, Object>> countByMonth();
}
