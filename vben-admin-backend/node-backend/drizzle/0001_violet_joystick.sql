CREATE TABLE `sys_dept` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pid` int NOT NULL DEFAULT 0,
	`name` varchar(64) NOT NULL,
	`status` tinyint NOT NULL DEFAULT 1,
	`remark` varchar(255),
	`create_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sys_dept_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE `sys_menu` ADD `type` varchar(16) DEFAULT 'menu' NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_menu` ADD `auth_code` varchar(64);--> statement-breakpoint
ALTER TABLE `sys_menu` ADD `status` tinyint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_menu` ADD `create_time` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_user` ADD `status` tinyint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_user` ADD `dept_id` int;--> statement-breakpoint
ALTER TABLE `sys_user` ADD `remark` varchar(255);--> statement-breakpoint
ALTER TABLE `sys_user` ADD `create_time` timestamp DEFAULT (now()) NOT NULL;