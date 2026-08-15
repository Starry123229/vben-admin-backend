-- 系统管理菜单种子（开箱即用）
-- 组件路径对应 web-antd 的 src/views/system/{user,role,dept,menu}/index.vue
-- 注意：在对应前端页面实现前，点开菜单会 404；页面实现后即正常。
-- 授权给超级管理员(1) 与管理员(2)；普通用户(3)不授权。

INSERT IGNORE INTO sys_menu (id, pid, name, type, path, component, status, sort, meta, create_time, update_time) VALUES
(100, 0,   'System',     'catalog', '/system', NULL,                 1, 1, '{"title":"系统管理","icon":"lucide:settings","order":1}',          NOW(), NOW()),
(101, 100, 'SystemUser', 'menu',    '/user',   '/system/user/index', 1, 0, '{"title":"用户管理","icon":"lucide:user"}',                         NOW(), NOW()),
(102, 100, 'SystemRole', 'menu',    '/role',   '/system/role/index', 1, 1, '{"title":"角色管理","icon":"lucide:users"}',                         NOW(), NOW()),
(103, 100, 'SystemDept', 'menu',    '/dept',   '/system/dept/index', 1, 2, '{"title":"部门管理","icon":"lucide:building-2"}',                    NOW(), NOW()),
(104, 100, 'SystemMenu', 'menu',    '/menu',   '/system/menu/index', 1, 3, '{"title":"菜单管理","icon":"lucide:menu"}',                          NOW(), NOW());

INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
(1, 100), (1, 101), (1, 102), (1, 103), (1, 104),
(2, 100), (2, 101), (2, 102), (2, 103), (2, 104);
