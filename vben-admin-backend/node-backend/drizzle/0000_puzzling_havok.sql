CREATE TABLE `sys_role_code` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(32) NOT NULL,
	`code` varchar(64) NOT NULL,
	CONSTRAINT `sys_role_code_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sys_menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pid` int NOT NULL DEFAULT 0,
	`name` varchar(64) NOT NULL,
	`path` varchar(128) NOT NULL,
	`component` varchar(128),
	`redirect` varchar(128),
	`meta` json NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `sys_menu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sys_role_menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(32) NOT NULL,
	`menu_id` int NOT NULL,
	CONSTRAINT `sys_role_menu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sys_refresh_token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_refresh_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `sys_refresh_token_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `sys_user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`password` varchar(100) NOT NULL,
	`real_name` varchar(64) NOT NULL,
	`roles` json NOT NULL,
	`home_path` varchar(128),
	CONSTRAINT `sys_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `sys_user_username_unique` UNIQUE(`username`)
);
