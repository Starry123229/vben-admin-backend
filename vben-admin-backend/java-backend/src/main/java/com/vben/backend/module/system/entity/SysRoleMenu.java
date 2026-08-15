package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 角色-菜单关联实体，对应表 sys_role_menu。
 *
 * @author Starry
 */
@Data
@TableName("sys_role_menu")
public class SysRoleMenu {

    private Long roleId;

    private Long menuId;
}
