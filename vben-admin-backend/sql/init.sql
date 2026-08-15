-- ============================================================
-- vben-admin-backend 数据库初始化脚本（两套后端共用）
-- 由 node-backend 的 Drizzle Schema 生成（drizzle-kit generate）
-- 种子数据请执行：node-backend 目录下 `pnpm seed`
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vben_admin`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vben_admin`;

-- 角色-权限码绑定（/auth/codes 数据源）
CREATE TABLE `sys_role_code` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(32) NOT NULL,
	`code` varchar(64) NOT NULL,
	CONSTRAINT `sys_role_code_id` PRIMARY KEY(`id`)
);

-- 部门表（树形结构，pid=0 为根节点，/system/dept CRUD 数据源）
CREATE TABLE `sys_dept` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pid` int NOT NULL DEFAULT 0,
	`name` varchar(64) NOT NULL,
	`status` tinyint NOT NULL DEFAULT 1,
	`remark` varchar(255),
	`create_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_dept_id` PRIMARY KEY(`id`)
);

-- 菜单表（一表两用：导航菜单 /menu/all 按角色绑定过滤；菜单管理 /system/menu/list 全量树）
CREATE TABLE `sys_menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pid` int NOT NULL DEFAULT 0,
	`name` varchar(64) NOT NULL,
	`path` varchar(128) NOT NULL,
	`component` varchar(128),
	`redirect` varchar(128),
	`meta` json NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	`type` varchar(16) NOT NULL DEFAULT 'menu',
	`auth_code` varchar(64),
	`status` tinyint NOT NULL DEFAULT 1,
	`create_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_menu_id` PRIMARY KEY(`id`)
);

-- 角色-菜单绑定（/menu/all 按用户角色过滤）
CREATE TABLE `sys_role_menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(32) NOT NULL,
	`menu_id` int NOT NULL,
	CONSTRAINT `sys_role_menu_id` PRIMARY KEY(`id`)
);

-- 刷新令牌（只存 SHA-256 哈希，令牌本体仅在用户 HttpOnly Cookie 中）
CREATE TABLE `sys_refresh_token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_refresh_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `sys_refresh_token_token_hash_unique` UNIQUE(`token_hash`)
);

-- 角色表（code 与 sys_user.roles、sys_role_menu.role 关联）
CREATE TABLE `sys_role` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`code` varchar(32) NOT NULL,
	`status` tinyint NOT NULL DEFAULT 1,
	`remark` varchar(255),
	`create_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_role_id` PRIMARY KEY(`id`),
	CONSTRAINT `sys_role_code_unique` UNIQUE(`code`)
);

-- 用户表（password 存 bcrypt 哈希；roles 为 JSON 数组）
CREATE TABLE `sys_user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`password` varchar(100) NOT NULL,
	`real_name` varchar(64) NOT NULL,
	`roles` json NOT NULL,
	`home_path` varchar(128),
	`status` tinyint NOT NULL DEFAULT 1,
	`dept_id` int,
	`remark` varchar(255),
	`create_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `sys_user_username_unique` UNIQUE(`username`)
);
