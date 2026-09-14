-- ==============================================================================
-- 后台管理系统数据库初始化脚本（Java / Node 双后端共用，契约见 docs/api-contract.md §6）
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
    `phone`         VARCHAR(32)  DEFAULT NULL COMMENT '手机号(手机号登录用)',
    `email`         VARCHAR(128) DEFAULT NULL COMMENT '邮箱(忘记密码用)',
    `dept_id`       BIGINT       DEFAULT NULL COMMENT '部门ID',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `remark`        VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `intro`         VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_email` (`email`)
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

-- ------------------------------------------------------------------------------ 通知消息表
CREATE TABLE IF NOT EXISTS `sys_notice` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '通知ID',
    `title`       VARCHAR(128) NOT NULL COMMENT '标题',
    `message`     TEXT         DEFAULT NULL COMMENT '消息内容',
    `avatar`      VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `link`        VARCHAR(255) DEFAULT NULL COMMENT '跳转链接',
    `is_read`     TINYINT      NOT NULL DEFAULT 0 COMMENT '是否已读:0否/1是',
    `user_id`     BIGINT       NOT NULL COMMENT '接收用户ID',
    `role_id`     BIGINT       DEFAULT NULL COMMENT '目标角色ID(广播用,NULL为直接发送)',
    `type`        VARCHAR(32)  DEFAULT 'info' COMMENT '通知类型:info/warning/success/error',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE = InnoDB COMMENT = '通知消息表';

-- ------------------------------------------------------------------------------ 系统参数配置表
CREATE TABLE IF NOT EXISTS `sys_config` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL COMMENT '参数名称',
    `key`         VARCHAR(100) NOT NULL COMMENT '参数键',
    `value`       TEXT         NOT NULL COMMENT '参数值',
    `type`        VARCHAR(20)  DEFAULT 'string' COMMENT '类型:string/number/boolean/json',
    `remark`      VARCHAR(500) DEFAULT NULL,
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_key` (`key`)
) ENGINE = InnoDB COMMENT = '系统参数配置表';

-- ------------------------------------------------------------------------------ 定时任务表
CREATE TABLE IF NOT EXISTS `sys_job` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT,
    `name`         VARCHAR(100) NOT NULL COMMENT '任务名称',
    `group_name`   VARCHAR(50)  DEFAULT 'DEFAULT' COMMENT '任务分组',
    `invoke_target` VARCHAR(255) NOT NULL COMMENT '调用目标(Bean.方法)',
    `cron`         VARCHAR(100) NOT NULL COMMENT 'cron表达式',
    `status`       TINYINT      NOT NULL DEFAULT 0 COMMENT '0暂停/1运行',
    `remark`       VARCHAR(500) DEFAULT NULL,
    `create_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB COMMENT = '定时任务表';

-- ------------------------------------------------------------------------------ 数据字典类型表
CREATE TABLE IF NOT EXISTS `sys_dict_type` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '字典ID',
    `name`        VARCHAR(100) NOT NULL COMMENT '字典名称',
    `code`        VARCHAR(100) NOT NULL COMMENT '字典编码',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE = InnoDB COMMENT = '字典类型表';

-- ------------------------------------------------------------------------------ 数据字典数据表
CREATE TABLE IF NOT EXISTS `sys_dict_data` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '数据ID',
    `type_id`     BIGINT       NOT NULL COMMENT '字典类型ID',
    `label`       VARCHAR(100) NOT NULL COMMENT '字典标签',
    `value`       VARCHAR(100) NOT NULL COMMENT '字典值',
    `sort`        INT          NOT NULL DEFAULT 0 COMMENT '排序(小在前)',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0停用/1启用',
    `css_class`   VARCHAR(100) DEFAULT NULL COMMENT 'CSS样式',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_type_id` (`type_id`)
) ENGINE = InnoDB COMMENT = '字典数据表';

-- ------------------------------------------------------------------------------ 操作日志表
CREATE TABLE IF NOT EXISTS `sys_operation_log` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id`        BIGINT       DEFAULT NULL COMMENT '操作用户ID',
    `username`       VARCHAR(64)  DEFAULT NULL COMMENT '操作用户名',
    `module`         VARCHAR(64)  DEFAULT NULL COMMENT '操作模块',
    `description`    VARCHAR(255) DEFAULT NULL COMMENT '操作描述',
    `method`         VARCHAR(255) DEFAULT NULL COMMENT '请求方法',
    `request_url`    VARCHAR(255) DEFAULT NULL COMMENT '请求URL',
    `request_method` VARCHAR(16)  DEFAULT NULL COMMENT 'HTTP方法',
    `request_params` TEXT         DEFAULT NULL COMMENT '请求参数',
    `ip`             VARCHAR(64)  DEFAULT NULL COMMENT 'IP地址',
    `status`         TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0失败/1成功',
    `error_msg`      TEXT         DEFAULT NULL COMMENT '错误信息',
    `cost_time`      BIGINT       DEFAULT NULL COMMENT '耗时(ms)',
    `create_time`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB COMMENT = '操作日志表';

-- ------------------------------------------------------------------------------ 登录日志表
CREATE TABLE IF NOT EXISTS `sys_login_log` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id`     BIGINT       DEFAULT NULL COMMENT '登录用户ID',
    `username`    VARCHAR(64)  DEFAULT NULL COMMENT '登录用户名',
    `ip`          VARCHAR(64)  DEFAULT NULL COMMENT 'IP地址',
    `location`    VARCHAR(255) DEFAULT NULL COMMENT '登录地点',
    `browser`     VARCHAR(128) DEFAULT NULL COMMENT '浏览器',
    `os`          VARCHAR(128) DEFAULT NULL COMMENT '操作系统',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:0失败/1成功',
    `message`     VARCHAR(255) DEFAULT NULL COMMENT '提示消息',
    `login_type`  VARCHAR(32)  DEFAULT NULL COMMENT '登录方式:account/phone/qrcode/oauth',
    `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB COMMENT = '登录日志表';

-- ==============================================================================
-- 演示数据
-- ==============================================================================

-- 角色
INSERT INTO `sys_role` (`id`, `name`, `code`, `status`) VALUES
(1, '超级管理员', 'super', 1),
(2, '管理员',     'admin', 1),
(3, '普通用户',   'user',  1);

-- 用户（password_hash = BCrypt('123456')；email/phone 供忘记密码、手机号登录演示）
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `home_path`, `email`, `phone`, `avatar`, `status`) VALUES
(1, 'vben',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Vben',  NULL,         'vben@vben-demo.com',  '13800000001', '/api/avatar/vben.svg',  1),
(2, 'admin', '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Admin', '/workspace', 'admin@vben-demo.com', '13800000002', '/api/avatar/admin.svg', 1),
(3, 'jack',  '$2a$10$pz916cL5nZa7hoSQ7/tadeI.i9wSELV9knz6n3NiKLetpw6k8Uun2', 'Jack',  '/analytics', 'jack@vben-demo.com',  '13800000003', '/api/avatar/jack.svg',  1);

INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1), (2, 2), (3, 3);

-- 菜单（与前端实际视图对齐：各 app 通用的 Dashboard / 系统管理目录
-- （用户/角色/部门/菜单管理）+ 通知管理。组件路径对应 src/views/**/index.vue）
INSERT INTO `sys_menu` (`id`, `pid`, `name`, `type`, `path`, `component`, `redirect`, `status`, `sort`, `auth_code`, `meta`) VALUES
(1,   0,   'Dashboard',               'catalog', '/dashboard',                NULL,                          '/analytics',                 1, 0, NULL,        '{"order":-1,"title":"page.dashboard.title"}'),
(2,   1,   'Analytics',               'menu',    '/analytics',                '/dashboard/analytics/index',  NULL,                         1, 0, NULL,        '{"affixTab":true,"title":"page.dashboard.analytics"}'),
(3,   1,   'Workspace',               'menu',    '/workspace',                '/dashboard/workspace/index',  NULL,                         1, 1, NULL,        '{"title":"page.dashboard.workspace"}'),
(21,  0,   'Profile',                 'menu',    '/profile',                  '_core/profile/index',          NULL,                         1, 3, NULL,        '{"hideInMenu":true,"icon":"lucide:user","title":"page.auth.profile"}'),
(100, 0,   'System',                  'catalog', '/system',                   NULL,                          '/system/user',               1, 1, NULL,        '{"icon":"lucide:settings","order":1,"title":"page.system.title"}'),
(101, 100, 'SystemUser',              'menu',    'user',                      '/system/user/index',          NULL,                         1, 0, NULL,        '{"icon":"lucide:user","order":0,"title":"page.system.user"}'),
(102, 100, 'SystemRole',              'menu',    'role',                      '/system/role/index',          NULL,                         1, 1, NULL,        '{"icon":"lucide:users","order":1,"title":"page.system.role"}'),
(103, 100, 'SystemDept',              'menu',    'dept',                      '/system/dept/index',          NULL,                         1, 2, NULL,        '{"icon":"lucide:building-2","order":2,"title":"page.system.dept"}'),
(104, 100, 'SystemMenu',              'menu',    'menu',                      '/system/menu/index',          NULL,                         1, 3, NULL,        '{"icon":"lucide:menu","order":3,"title":"page.system.menu"}'),
(105, 100, 'Notice',                  'menu',    'notice',                    '/system/notice/index',        NULL,                         1, 10, NULL,       '{"icon":"lucide:bell","order":10,"title":"page.system.notice"}'),
(106, 100, 'OperationLog',             'menu',    'operation-log',              '/system/operation-log/index', NULL,                        1, 4, NULL,        '{"icon":"lucide:file-text","order":4,"title":"page.system.operationLog"}'),
(107, 100, 'LoginLog',                 'menu',    'login-log',                  '/system/login-log/index',     NULL,                        1, 5, NULL,        '{"icon":"lucide:log-in","order":5,"title":"page.system.loginLog"}'),
(108, 100, 'Dict',                     'menu',    'dict',                       '/system/dict/index',           NULL,                        1, 6, NULL,        '{"icon":"lucide:book-open","order":6,"title":"page.system.dict"}'),
(109, 100, 'DictData',                 'menu',    'dict/data/:typeId',          '/system/dict/data',            NULL,                        1, 0, NULL,        '{"activePath":"/system/dict","hideInMenu":true,"title":"字典数据"}'),
(1001,101, 'SystemUserCreate',        'button',  NULL,                        NULL,                          NULL,                         1, 0, 'AC_100010', '{"title":"新增用户"}'),
(1002,101, 'SystemUserUpdate',        'button',  NULL,                        NULL,                          NULL,                         1, 1, 'AC_100020', '{"title":"编辑用户"}'),
(1003,101, 'SystemUserDelete',        'button',  NULL,                        NULL,                          NULL,                         1, 2, 'AC_100030', '{"title":"删除用户"}'),
(1006,101, 'SystemUserView',          'button',  NULL,                        NULL,                          NULL,                         1, 3, 'AC_1000000', '{"title":"查看用户"}'),
(1004,102, 'SystemRoleView',          'button',  NULL,                        NULL,                          NULL,                         1, 0, 'AC_1000001', '{"title":"查看角色"}'),
(1005,102, 'SystemRoleEdit',          'button',  NULL,                        NULL,                          NULL,                         1, 1, 'AC_1000002', '{"title":"编辑角色"}');

-- button 型权限码节点：业务按钮权限码请在自己的后台管理（/system/menu）中维护，对应 GET /auth/codes。
-- 前端按钮显隐（CellOperation accessCode / hasAccessByCodes）与后端 @SaCheckPermission 共用同一套码。

-- 授权关系（super/admin: 全部码；user: 用户管理只读 + 角色管理可编辑——用于演示按钮级权限）
-- user 角色持有「系统管理目录 + 用户管理页 + 查看用户码」：页面可见，但新增/编辑/删除按钮隐藏、对应接口 403；
-- 同时持有「角色管理页 + 查看/编辑角色码」：页面可见且按钮齐全。
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES
-- 公共菜单：三角色一致（Dashboard 目录 + Analytics + Profile）
-- 注意：admin 的 home_path 为 /workspace，故 admin 角色必须包含菜单 3（工作台），否则登录后 404
(1,1),(1,2),(1,3),(1,21),
(2,1),(2,2),(2,3),(2,21),
(3,1),(3,2),(3,21),
-- 系统管理 + 通知管理：super / admin 全部页面；user 仅系统管理目录 + 用户管理页
(1,100),(1,101),(1,102),(1,103),(1,104),(1,105),(1,106),(1,107),(1,108),(1,109),(1,110),(1,111),(1,112),(1,113),(1,1019),(1,1020),(1,1021),(1,1022),
(2,100),(2,101),(2,102),(2,103),(2,104),(2,105),(2,106),(2,107),(2,108),(2,109),(2,110),(2,111),(2,112),(2,113),(2,1019),(2,1020),(2,1021),(2,1022),
(3,100),(3,102),
-- 按钮权限：super/admin 全部；user = 用户只读(1006)，无增删改及角色管理码
(1,1001),(1,1002),(1,1003),(1,1006),(1,1004),(1,1005),
(2,1001),(2,1002),(2,1003),(2,1006),(2,1004),(2,1005),
(3,1006);

-- 部门（用户管理页左侧部门树过滤器）
INSERT INTO `sys_dept` (`id`, `pid`, `name`, `status`, `remark`) VALUES
(1, 0, '总公司', 1, '顶级部门');

-- 通知消息（按用户发送演示数据）
INSERT INTO `sys_notice` (`title`, `message`, `avatar`, `link`, `is_read`, `user_id`, `type`) VALUES
('欢迎使用系统', '您已成功登录系统，开始您的工作吧！', 'https://avatar.vercel.sh/vercel.svg?text=VB', '/analytics', 1, 1, 'info'),
('系统维护通知', '系统将于本周末凌晨2:00-4:00进行维护升级，请提前保存工作内容。', 'https://avatar.vercel.sh/1', NULL, 0, 1, 'warning'),
('新功能上线', '用户管理模块已上线，支持按部门筛选和状态切换。', 'https://avatar.vercel.sh/1', '/system/user', 0, 1, 'success'),
('欢迎使用系统', '您已成功登录系统（管理员）。', 'https://avatar.vercel.sh/vercel.svg?text=VB', '/analytics', 0, 2, 'info'),
('权限变更通知', '您的管理员权限已更新，请重新登录以刷新权限。', 'https://avatar.vercel.sh/1', NULL, 0, 2, 'warning'),
('欢迎使用系统', '您已成功登录系统（普通用户）。', 'https://avatar.vercel.sh/vercel.svg?text=VB', '/analytics', 0, 3, 'info');

-- 系统参数配置
INSERT INTO `sys_config` (`name`, `key`, `value`, `type`, `remark`) VALUES
('系统名称', 'sys.name', 'Vben Admin', 'string', '系统显示名称'),
('默认密码', 'sys.default-password', '123456', 'string', '新增用户/重置密码时的默认密码'),
('登录失败次数', 'sys.login.max-fail-count', '5', 'number', '连续登录失败次数限制'),
('账号锁定时长(分钟)', 'sys.login.lock-minutes', '30', 'number', '账号锁定时长'),
('Token有效期(秒)', 'sys.token.timeout', '7200', 'number', 'accessToken有效期');

-- 定时任务
INSERT INTO `sys_job` (`name`, `group_name`, `invoke_target`, `cron`, `status`, `remark`) VALUES
('系统状态检查', 'SYSTEM', 'systemMonitorTask.checkStatus', '0 0 * * * ?', 0, '每小时检查系统状态'),
('清理过期Token', 'SYSTEM', 'authCleanupTask.cleanExpiredTokens', '0 30 * * * ?', 0, '每小时清理过期Token');

-- 数据字典类型
INSERT INTO `sys_dict_type` (`id`, `name`, `code`, `status`, `remark`) VALUES
(1, '用户性别', 'sys_user_gender', 1, '用户性别列表'),
(2, '菜单状态', 'sys_menu_status', 1, '菜单状态列表'),
(3, '通知类型', 'sys_notice_type', 1, '通知类型列表');

-- 数据字典数据
INSERT INTO `sys_dict_data` (`type_id`, `label`, `value`, `sort`, `status`, `css_class`) VALUES
(1, '男', '1', 1, 1, 'primary'),
(1, '女', '0', 2, 1, 'danger'),
(1, '未知', '2', 3, 1, 'info'),
(2, '启用', '1', 1, 1, 'success'),
(2, '停用', '0', 2, 1, 'error'),
(3, '通知', 'info', 1, 1, 'primary'),
(3, '成功', 'success', 2, 1, 'success'),
(3, '警告', 'warning', 3, 1, 'warning'),
(3, '错误', 'error', 4, 1, 'danger');

-- ==============================================================================
-- 站内信表
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_message` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT       NOT NULL DEFAULT 0  COMMENT '接收人用户ID（0=全员广播）',
    `sender_id`   BIGINT       NOT NULL DEFAULT 0  COMMENT '发送人用户ID（0=系统消息）',
    `title`       VARCHAR(255) NOT NULL            COMMENT '消息标题',
    `content`     TEXT                              COMMENT '消息内容',
    `type`        VARCHAR(50)  DEFAULT 'notice'     COMMENT '消息类型：notice/alert/task',
    `biz_id`      VARCHAR(100) DEFAULT NULL         COMMENT '业务关联ID',
    `is_read`     TINYINT      NOT NULL DEFAULT 0   COMMENT '是否已读：0=未读 1=已读',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内信';

-- ==============================================================================
-- 附件中心表
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_attachment` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT,
    `original_name`   VARCHAR(500) NOT NULL             COMMENT '原始文件名',
    `storage_path`    VARCHAR(500) NOT NULL             COMMENT '存储路径/对象key',
    `file_size`       BIGINT       DEFAULT 0            COMMENT '文件大小(字节)',
    `content_type`    VARCHAR(200) DEFAULT NULL         COMMENT 'MIME类型',
    `file_ext`        VARCHAR(20)  DEFAULT NULL         COMMENT '文件后缀',
    `md5_hash`        VARCHAR(64)  DEFAULT NULL         COMMENT 'MD5哈希',
    `upload_user_id`  BIGINT       DEFAULT 0            COMMENT '上传人ID',
    `upload_username` VARCHAR(100) DEFAULT NULL         COMMENT '上传人用户名',
    `biz_type`        VARCHAR(50)  DEFAULT NULL         COMMENT '业务类型',
    `biz_id`          VARCHAR(100) DEFAULT NULL         COMMENT '业务ID',
    `url`             VARCHAR(500) DEFAULT NULL         COMMENT '访问URL',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_md5` (`md5_hash`),
    INDEX `idx_biz` (`biz_type`, `biz_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件中心';

-- ==============================================================================
-- 审计日志表（数据变更对比）
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_audit_log` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT       DEFAULT 0            COMMENT '操作人ID',
    `username`       VARCHAR(100) DEFAULT NULL         COMMENT '操作人用户名',
    `module`         VARCHAR(50)  DEFAULT NULL         COMMENT '操作模块',
    `operation`      VARCHAR(20)  DEFAULT NULL         COMMENT '操作类型(CREATE/UPDATE/DELETE)',
    `entity_type`    VARCHAR(100) DEFAULT NULL         COMMENT '实体类型',
    `entity_id`      VARCHAR(64)  DEFAULT NULL         COMMENT '实体ID',
    `old_data`       TEXT                              COMMENT '变更前数据(JSON)',
    `new_data`       TEXT                              COMMENT '变更后数据(JSON)',
    `changed_fields` TEXT                              COMMENT '变更字段摘要',
    `ip`             VARCHAR(64)  DEFAULT NULL         COMMENT '请求IP',
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_module` (`module`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志';

-- ==============================================================================
-- 工作流定义表
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_workflow` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL             COMMENT '流程名称',
    `code`        VARCHAR(50)  NOT NULL             COMMENT '流程编码',
    `type`        VARCHAR(50)  DEFAULT 'approval'   COMMENT '流程类型',
    `definition`  TEXT                              COMMENT '流程定义(JSON审批链)',
    `status`      TINYINT      NOT NULL DEFAULT 1   COMMENT '状态:0=禁用 1=启用',
    `remark`      VARCHAR(500) DEFAULT NULL         COMMENT '备注',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流定义';

-- ==============================================================================
-- 工作流实例表（审批申请）
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_workflow_instance` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `workflow_id`    BIGINT       NOT NULL             COMMENT '工作流定义ID',
    `workflow_name`  VARCHAR(100) DEFAULT NULL         COMMENT '流程名称(冗余)',
    `applicant_id`   BIGINT       NOT NULL             COMMENT '申请人ID',
    `applicant_name` VARCHAR(100) DEFAULT NULL         COMMENT '申请人用户名',
    `title`          VARCHAR(200) NOT NULL             COMMENT '申请标题',
    `content`        TEXT                              COMMENT '申请内容',
    `current_step`   INT          DEFAULT 0            COMMENT '当前审批步骤',
    `total_steps`    INT          DEFAULT 0            COMMENT '总审批步骤数',
    `status`         VARCHAR(20)  DEFAULT 'pending'    COMMENT '状态:pending/approved/rejected/cancelled',
    `biz_type`       VARCHAR(50)  DEFAULT NULL         COMMENT '业务类型',
    `biz_id`         VARCHAR(64)  DEFAULT NULL         COMMENT '业务ID',
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `finish_time`    DATETIME     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_applicant` (`applicant_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流实例';

-- ==============================================================================
-- 工作流审批任务表
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `sys_workflow_task` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT,
    `instance_id`   BIGINT       NOT NULL             COMMENT '工作流实例ID',
    `step`          INT          NOT NULL             COMMENT '审批步骤序号',
    `approver_id`   BIGINT       NOT NULL             COMMENT '审批人ID',
    `approver_name` VARCHAR(100) DEFAULT NULL         COMMENT '审批人用户名',
    `action`        VARCHAR(20)  NOT NULL             COMMENT '审批动作:approve/reject',
    `comment`       TEXT                              COMMENT '审批意见',
    `approve_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流审批任务';
