-- ==============================================================================
-- Vben Admin 数据库初始化脚本（Java / Node 双后端共用，契约见 docs/api-contract.md §6）
-- 数据库: MySQL 8.4+, 字符集 utf8mb4。执行本文件即完成建库建表并灌入演示数据。
-- 演示账号: vben / admin / jack，密码均为 123456。
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `vben_admin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vben_admin`;

-- ------------------------------------------------------------------------------ 用户表
CREATE TABLE IF NOT EXISTS `sys_user` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username`      VARCHAR(64)  NOT NULL COMMENT '登录名',
    `password_hash` VARCHAR(100) NOT NULL COMMENT '密码哈希(BCrypt)',
    `real_name`     VARCHAR(64)  DEFAULT NULL COMMENT '真实姓名',
    `avatar`        VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `home_path`     VARCHAR(255) DEFAULT NULL COMMENT '登录后首页路径',
    `dept_id`       BIGINT       DEFAULT NULL COMMENT '部门ID',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `remark`        VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE = InnoDB COMMENT = '用户表';

-- ------------------------------------------------------------------------------ 角色表
CREATE TABLE IF NOT EXISTS `sys_role` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `name`        VARCHAR(64) NOT NULL COMMENT '角色名称',
    `code`        VARCHAR(64) NOT NULL COMMENT '角色编码(super/admin/user)',
    `status`      TINYINT     NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE = InnoDB COMMENT = '角色表';

-- ------------------------------------------------------------------------------ 用户-角色关联表
CREATE TABLE IF NOT EXISTS `sys_user_role` (
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`)
) ENGINE = InnoDB COMMENT = '用户角色关联表';

-- ------------------------------------------------------------------------------ 菜单表(catalog目录/menu页面/button按钮/embedded内嵌/link外链)
CREATE TABLE IF NOT EXISTS `sys_menu` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
    `pid`        BIGINT       NOT NULL DEFAULT 0 COMMENT '父ID(根为0)',
    `name`       VARCHAR(64)  NOT NULL COMMENT '路由名(唯一)',
    `type`       VARCHAR(16)  NOT NULL DEFAULT 'menu' COMMENT '类型',
    `path`       VARCHAR(255) DEFAULT NULL COMMENT '路由路径',
    `component`  VARCHAR(255) DEFAULT NULL COMMENT '组件:BasicLayout/IFrameView/views相对路径',
    `redirect`   VARCHAR(255) DEFAULT NULL COMMENT '目录节点重定向目标',
    `auth_code`  VARCHAR(128) DEFAULT NULL COMMENT '权限码(按钮型菜单使用,对应 /auth/codes)',
    `icon`       VARCHAR(128) DEFAULT NULL COMMENT '图标(iconify名)',
    `status`     TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `sort`       INT          NOT NULL DEFAULT 0 COMMENT '排序(小在前)',
    `meta`       JSON         DEFAULT NULL COMMENT '前端meta(标题/角标/affixTab等)',
    `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE = InnoDB COMMENT = '菜单表';

-- ------------------------------------------------------------------------------ 角色-菜单关联表
CREATE TABLE IF NOT EXISTS `sys_role_menu` (
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `menu_id` BIGINT NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (`role_id`, `menu_id`)
) ENGINE = InnoDB COMMENT = '角色菜单关联表';

-- ------------------------------------------------------------------------------ 部门表
CREATE TABLE IF NOT EXISTS `sys_dept` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '部门ID',
    `pid`         BIGINT      NOT NULL DEFAULT 0 COMMENT '父ID(根为0)',
    `name`        VARCHAR(64) NOT NULL COMMENT '部门名称',
    `status`      TINYINT     NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB COMMENT = '部门表';

-- ------------------------------------------------------------------------------ 刷新令牌表(服务端侧refresh token登记,支持轮换与吊销)
CREATE TABLE IF NOT EXISTS `sys_refresh_token` (
    `id`         BIGINT      NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT      NOT NULL COMMENT '用户ID',
    `token_hash` VARCHAR(128) NOT NULL COMMENT 'token哈希(SHA-256,不存原文)',
    `expires_at` DATETIME    NOT NULL COMMENT '过期时间',
    `revoked`    TINYINT     NOT NULL DEFAULT 0 COMMENT '是否已作废:0否/1是',
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_token_hash` (`token_hash`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB COMMENT = '刷新令牌表';

-- ==============================================================================
-- 演示数据
-- ==============================================================================

-- 角色
INSERT INTO `sys_role` (`id`, `name`, `code`, `status`) VALUES
(1, '超级管理员', 'super', 1),
(2, '管理员',     'admin', 1),
(3, '普通用户',   'user',  1);

-- 用户（password_hash = BCrypt('123456')）
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `home_path`, `status`) VALUES
(1, 'vben',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Vben',  NULL,         1),
(2, 'admin', '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Admin', '/workspace', 1),
(3, 'jack',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Jack',  '/analytics', 1);

INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1), (2, 2), (3, 3);

-- 菜单（与 mock 行为一致：Dashboard / Demos 权限演示 / About）
INSERT INTO `sys_menu` (`id`, `pid`, `name`, `type`, `path`, `component`, `redirect`, `status`, `sort`, `meta`) VALUES
(1,  0,  'Dashboard',               'catalog', '/dashboard',                NULL,                          '/analytics',                 1, 0, '{"order":-1,"title":"page.dashboard.title"}'),
(2,  1,  'Analytics',               'menu',    '/analytics',                '/dashboard/analytics/index',  NULL,                         1, 0, '{"affixTab":true,"title":"page.dashboard.analytics"}'),
(3,  1,  'Workspace',               'menu',    '/workspace',                '/dashboard/workspace/index',  NULL,                         1, 1, '{"title":"page.dashboard.workspace"}'),
(10, 0,  'Demos',                   'catalog', '/demos',                    NULL,                          '/demos/access',              1, 1, '{"icon":"ic:baseline-view-in-ar","keepAlive":true,"order":1000,"title":"demos.title"}'),
(11, 10, 'AccessDemos',             'catalog', '/demosaccess',              NULL,                          '/demos/access/page-control', 1, 0, '{"icon":"mdi:cloud-key-outline","title":"demos.access.backendPermissions"}'),
(12, 11, 'AccessPageControlDemo',   'menu',    '/demos/access/page-control','/demos/access/index',         NULL,                         1, 0, '{"icon":"mdi:page-previous-outline","title":"demos.access.pageAccess"}'),
(13, 11, 'AccessButtonControlDemo', 'menu',    '/demos/access/button-control','/demos/access/button-control',NULL,                        1,1,'{"icon":"mdi:button-cursor","title":"demos.access.buttonControl"}'),
(14, 11, 'AccessMenuVisible403Demo','menu',    '/demos/access/menu-visible-403','/demos/access/menu-visible-403',NULL,1,2,'{"authority":["no-body"],"icon":"mdi:button-cursor","menuVisibleWithForbidden":true,"title":"demos.access.menuVisible403"}'),
(15, 11, 'AccessAdminVisibleDemo',  'menu',    '/demos/access/admin-visible','/demos/access/admin-visible', NULL,                         1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.adminVisible"}'),
(16, 11, 'AccessSuperVisibleDemo',  'menu',    '/demos/access/super-visible','/demos/access/super-visible', NULL,                         1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.superVisible"}'),
(17, 11, 'AccessUserVisibleDemo',   'menu',    '/demos/access/user-visible', '/demos/access/user-visible',  NULL,                         1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.userVisible"}'),
(20, 0,  'About',                   'menu',    '/about',                    '_core/about/index',           NULL,                         1, 2, '{"icon":"lucide:copyright","order":9999,"title":"demos.vben.about"}');

-- button 型权限码节点（auth_code 对应 GET /auth/codes）
INSERT INTO `sys_menu` (`id`, `pid`, `name`, `type`, `auth_code`, `status`, `sort`) VALUES
(101, 12, 'ButtonAc100100',  'button', 'AC_100100',  1, 0),
(102, 12, 'ButtonAc100110',  'button', 'AC_100110',  1, 0),
(103, 12, 'ButtonAc100120',  'button', 'AC_100120',  1, 0),
(104, 12, 'ButtonAc100010',  'button', 'AC_100010',  1, 0),
(105, 12, 'ButtonAc100020',  'button', 'AC_100020',  1, 0),
(106, 12, 'ButtonAc100030',  'button', 'AC_100030',  1, 0),
(107, 12, 'ButtonAc1000001', 'button', 'AC_1000001', 1, 0),
(108, 12, 'ButtonAc1000002', 'button', 'AC_1000002', 1, 0);

-- 授权关系（super: 全部权限码；admin: AC_100010/20/30；user: AC_1000001/02，对齐 mock）
-- 14 号「菜单可见但 403」演示节点授权给全部角色：mock 对三角色均返回，由前端 authority:['no-body'] 过滤
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
-- 公共菜单：三角色一致
(1,1),(1,2),(1,3),(1,10),(1,11),(1,12),(1,13),(1,14),(1,20),
(2,1),(2,2),(2,3),(2,10),(2,11),(2,12),(2,13),(2,14),(2,20),
(3,1),(3,2),(3,3),(3,10),(3,11),(3,12),(3,13),(3,14),(3,20),
-- 角色专属可见页
(1,16), (2,15), (3,17),
-- 按钮权限码：super
(1,101),(1,102),(1,103),(1,104),
-- admin
(2,104),(2,105),(2,106),
-- user
(3,107),(3,108);
