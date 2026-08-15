-- ==============================================================================
-- Vben Admin 共享演示数据（Java / Node 双后端共用，契约见 docs/api-contract.md）
-- 账号: vben / admin / jack，密码均为 123456。先执行 schema.sql 再执行本文件。
-- ==============================================================================
USE `vben_admin`;

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
INSERT INTO `sys_menu` (`id`, `pid`, `name`, `type`, `path`, `component`, `status`, `sort`, `meta`) VALUES
(1,  0,  'Dashboard',               'catalog', '/dashboard',                NULL,                          1, 0, '{"order":-1,"title":"page.dashboard.title"}'),
(2,  1,  'Analytics',               'menu',    '/analytics',                '/dashboard/analytics/index',  1, 0, '{"affixTab":true,"title":"page.dashboard.analytics"}'),
(3,  1,  'Workspace',               'menu',    '/workspace',                '/dashboard/workspace/index',  1, 1, '{"title":"page.dashboard.workspace"}'),
(10, 0,  'Demos',                   'catalog', '/demos',                    NULL,                          1, 1, '{"icon":"ic:baseline-view-in-ar","keepAlive":true,"order":1000,"title":"demos.title"}'),
(11, 10, 'AccessDemos',             'catalog', '/demosaccess',              NULL,                          1, 0, '{"icon":"mdi:cloud-key-outline","title":"demos.access.backendPermissions"}'),
(12, 11, 'AccessPageControlDemo',   'menu',    '/demos/access/page-control','/demos/access/index',         1, 0, '{"icon":"mdi:page-previous-outline","title":"demos.access.pageAccess"}'),
(13, 11, 'AccessButtonControlDemo', 'menu',    '/demos/access/button-control','/demos/access/button-control',1,1,'{"icon":"mdi:button-cursor","title":"demos.access.buttonControl"}'),
(14, 11, 'AccessMenuVisible403Demo','menu',    '/demos/access/menu-visible-403','/demos/access/menu-visible-403',1,2,'{"authority":["no-body"],"icon":"mdi:button-cursor","menuVisibleWithForbidden":true,"title":"demos.access.menuVisible403"}'),
(15, 11, 'AccessAdminVisibleDemo',  'menu',    '/demos/access/admin-visible','/demos/access/admin-visible', 1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.adminVisible"}'),
(16, 11, 'AccessSuperVisibleDemo',  'menu',    '/demos/access/super-visible','/demos/access/super-visible', 1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.superVisible"}'),
(17, 11, 'AccessUserVisibleDemo',   'menu',    '/demos/access/user-visible', '/demos/access/user-visible',  1, 3, '{"icon":"mdi:button-cursor","title":"demos.access.userVisible"}'),
(20, 0,  'About',                   'menu',    '/about',                    '_core/about/index',           1, 2, '{"icon":"lucide:copyright","order":9999,"title":"demos.vben.about"}');

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
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
-- 公共菜单：三角色一致
(1,1),(1,2),(1,3),(1,10),(1,11),(1,12),(1,13),(1,20),
(2,1),(2,2),(2,3),(2,10),(2,11),(2,12),(2,13),(2,20),
(3,1),(3,2),(3,3),(3,10),(3,11),(3,12),(3,13),(3,20),
-- 角色专属可见页
(1,16), (2,15), (3,17),
-- 按钮权限码：super
(1,101),(1,102),(1,103),(1,104),
-- admin
(2,104),(2,105),(2,106),
-- user
(3,107),(3,108);
