package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 菜单实体，对应表 sys_menu。
 *
 * @author Starry
 */
@Data
@TableName("sys_menu")
public class SysMenu {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 父 ID（根为 0） */
    private Long pid;

    /** 路由名（唯一） */
    private String name;

    /** 类型：catalog/menu/button/embedded/link */
    private String type;

    /** 路由路径 */
    private String path;

    /** 组件：BasicLayout/IFrameView/views 相对路径 */
    private String component;

    /** 权限码（button 型使用，对应 /auth/codes） */
    private String authCode;

    /** 图标（iconify 名） */
    private String icon;

    /** 状态：0 停用 / 1 启用 */
    private Integer status;

    /** 排序（小在前） */
    private Integer sort;

    /** 前端 meta JSON 字符串（title/badge/affixTab 等），由服务层解析组装 */
    private String meta;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
