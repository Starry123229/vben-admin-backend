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
INSERT IGNORE INTO `sys_role` (`id`, `name`, `code`, `status`) VALUES
(1, '超级管理员', 'super', 1),
(2, '管理员',     'admin', 1),
(3, '普通用户',   'user',  1);

-- 用户（password_hash = BCrypt('123456')）
INSERT IGNORE INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `home_path`, `status`) VALUES
(1, 'vben',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Vben',  NULL,         1),
(2, 'admin', '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Admin', '/workspace', 1),
(3, 'jack',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Jack',  '/analytics', 1);

INSERT IGNORE INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1), (2, 2), (3, 3);

-- 菜单（与前端实际视图对齐：仅保留各 app 通用存在的 Dashboard / About。
-- 原 Vben 完整模板的 Demos/Access 权限演示页在轻量版 apps/* 中不存在对应 .vue，会被前端回退成 404，故移除）
INSERT IGNORE INTO `sys_menu` (`id`, `pid`, `name`, `type`, `path`, `component`, `redirect`, `status`, `sort`, `meta`) VALUES
(1,  0,  'Dashboard',               'catalog', '/dashboard',                NULL,                          '/analytics',                 1, 0, '{"order":-1,"title":"page.dashboard.title"}'),
(2,  1,  'Analytics',               'menu',    '/analytics',                '/dashboard/analytics/index',  NULL,                         1, 0, '{"affixTab":true,"title":"page.dashboard.analytics"}'),
(3,  1,  'Workspace',               'menu',    '/workspace',                '/dashboard/workspace/index',  NULL,                         1, 1, '{"title":"page.dashboard.workspace"}'),
(20, 0,  'About',                   'menu',    '/about',                    '_core/about/index',           NULL,                         1, 2, '{"icon":"lucide:copyright","order":9999,"title":"demos.vben.about"}');

-- button 型权限码节点：原 Access 演示按钮（pid=12 的演示页）已随 Demos 一并移除；
-- 业务按钮权限码请在自己的后台管理（/system/menu）中维护，对应 GET /auth/codes。

-- 授权关系（super: 全部权限码；admin: AC_100010/20/30；user: AC_1000001/02，对齐 mock）
-- 14 号「菜单可见但 403」演示节点授权给全部角色：mock 对三角色均返回，由前端 authority:['no-body'] 过滤
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
-- 公共菜单：三角色一致（Dashboard 目录 + Analytics + Workspace + About）
(1,1),(1,2),(1,3),(1,20),
(2,1),(2,2),(2,3),(2,20),
(3,1),(3,2),(3,3),(3,20);

-- 系统管理菜单（组件路径对应各 app 的 src/views/system/{user,role,dept,menu}/index.vue；
-- 前端 accessMode:'backend' 经 /menu/all 拉取并生成路由。授权给超级管理员(1)与管理员(2)，普通用户(3)不授权）
INSERT IGNORE INTO `sys_menu` (`id`, `pid`, `name`, `type`, `path`, `component`, `status`, `sort`, `meta`) VALUES
(100, 0,   'System',     'catalog', '/system', NULL,                  1, 1, '{"title":"系统管理","icon":"lucide:settings","order":1}'),
(101, 100, 'SystemUser', 'menu',    '/user',   '/system/user/index',  1, 0, '{"title":"用户管理","icon":"lucide:user"}'),
(102, 100, 'SystemRole', 'menu',    '/role',   '/system/role/index',  1, 1, '{"title":"角色管理","icon":"lucide:users"}'),
(103, 100, 'SystemDept', 'menu',    '/dept',   '/system/dept/index',  1, 2, '{"title":"部门管理","icon":"lucide:building-2"}'),
(104, 100, 'SystemMenu', 'menu',    '/menu',   '/system/menu/index',  1, 3, '{"title":"菜单管理","icon":"lucide:menu"}');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
(1, 100), (1, 101), (1, 102), (1, 103), (1, 104),
(2, 100), (2, 101), (2, 102), (2, 103), (2, 104);
