package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysRoleMenu;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 角色-菜单关联 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysRoleMenuMapper extends BaseMapper<SysRoleMenu> {

    /**
     * 批量插入角色-菜单关联（替代循环逐条 insert）。
     */
    @Insert({
        "<script>",
        "INSERT INTO sys_role_menu (role_id, menu_id) VALUES",
        "<foreach collection='list' item='item' separator=','>",
        "(#{item.roleId}, #{item.menuId})",
        "</foreach>",
        "</script>"
    })
    int insertBatch(@Param("list") List<SysRoleMenu> list);
}
