package com.vben.backend.module.system.dto;

import lombok.Data;

/**
 * 菜单保存（新建/更新）请求体。
 *
 * @author Starry
 */
@Data
public class MenuSaveRequest {

    /** 菜单 ID（更新时必填，新建时忽略） */
    private Long id;

    /** 父 ID（根为 0） */
    private Long pid;

    /** 路由名（唯一） */
    private String name;

    /** 类型：catalog/menu/button/embedded/link */
    private String type;

    /** 路由路径 */
    private String path;

    /** 组件路径（BasicLayout/IFrameView 或 views 相对路径） */
    private String component;

    /** 目录重定向目标 */
    private String redirect;

    /** 权限码（button 型使用） */
    private String authCode;

    /** 图标（iconify 名） */
    private String icon;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 排序（小在前） */
    private Integer sort;

    /** 前端 meta 的 JSON 字符串（title/icon/badge/affixTab 等） */
    private String meta;
}
