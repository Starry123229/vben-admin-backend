package com.vben.backend.module.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 角色-菜单分配请求体。
 *
 * @author Starry
 */
@Data
public class AssignMenuRequest {

    /** 分配给该角色的菜单 ID 列表（含目录/菜单/按钮；传空列表表示清空） */
    private List<Long> menuIds;
}
