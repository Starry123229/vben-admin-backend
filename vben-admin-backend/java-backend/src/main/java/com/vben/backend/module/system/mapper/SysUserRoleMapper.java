package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysUserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 用户-角色关联 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {

    /**
     * 按角色统计用户数（一次查询替代 N+1）。
     * 返回 [{roleId, roleName, roleCode, cnt}, ...]
     */
    @Select("""
            SELECT r.id AS roleId, r.name AS roleName, r.code AS roleCode, COUNT(ur.user_id) AS cnt
            FROM sys_role r
            LEFT JOIN sys_user_role ur ON ur.role_id = r.id
            GROUP BY r.id, r.name, r.code
            """)
    List<Map<String, Object>> countByRole();

    /**
     * 批量插入用户-角色关联（替代循环逐条 insert）。
     */
    @Insert({
        "<script>",
        "INSERT INTO sys_user_role (user_id, role_id) VALUES",
        "<foreach collection='list' item='item' separator=','>",
        "(#{item.userId}, #{item.roleId})",
        "</foreach>",
        "</script>"
    })
    int insertBatch(@Param("list") List<SysUserRole> list);
}
