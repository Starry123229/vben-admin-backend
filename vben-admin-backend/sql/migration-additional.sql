-- 新增功能建表SQL
CREATE TABLE IF NOT EXISTS `sys_message` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT       NOT NULL DEFAULT 0,
    `sender_id`   BIGINT       NOT NULL DEFAULT 0,
    `title`       VARCHAR(255) NOT NULL,
    `content`     TEXT,
    `type`        VARCHAR(50)  DEFAULT 'notice',
    `biz_id`      VARCHAR(100) DEFAULT NULL,
    `is_read`     TINYINT      NOT NULL DEFAULT 0,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内信';

CREATE TABLE IF NOT EXISTS `sys_attachment` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT,
    `original_name`   VARCHAR(500) NOT NULL,
    `storage_path`    VARCHAR(500) NOT NULL,
    `file_size`       BIGINT       DEFAULT 0,
    `content_type`    VARCHAR(200) DEFAULT NULL,
    `file_ext`        VARCHAR(20)  DEFAULT NULL,
    `md5_hash`        VARCHAR(64)  DEFAULT NULL,
    `upload_user_id`  BIGINT       DEFAULT 0,
    `upload_username` VARCHAR(100) DEFAULT NULL,
    `biz_type`        VARCHAR(50)  DEFAULT NULL,
    `biz_id`          VARCHAR(100) DEFAULT NULL,
    `url`             VARCHAR(500) DEFAULT NULL,
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_md5` (`md5_hash`),
    INDEX `idx_biz` (`biz_type`, `biz_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件中心';

CREATE TABLE IF NOT EXISTS `sys_audit_log` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT       DEFAULT 0,
    `username`       VARCHAR(100) DEFAULT NULL,
    `module`         VARCHAR(50)  DEFAULT NULL,
    `operation`      VARCHAR(20)  DEFAULT NULL,
    `entity_type`    VARCHAR(100) DEFAULT NULL,
    `entity_id`      VARCHAR(64)  DEFAULT NULL,
    `old_data`       TEXT,
    `new_data`       TEXT,
    `changed_fields` TEXT,
    `ip`             VARCHAR(64)  DEFAULT NULL,
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_module` (`module`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志';

CREATE TABLE IF NOT EXISTS `sys_workflow` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL,
    `code`        VARCHAR(50)  NOT NULL,
    `type`        VARCHAR(50)  DEFAULT 'approval',
    `definition`  TEXT,
    `status`      TINYINT      NOT NULL DEFAULT 1,
    `remark`      VARCHAR(500) DEFAULT NULL,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流定义';

CREATE TABLE IF NOT EXISTS `sys_workflow_instance` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `workflow_id`    BIGINT       NOT NULL,
    `workflow_name`  VARCHAR(100) DEFAULT NULL,
    `applicant_id`   BIGINT       NOT NULL,
    `applicant_name` VARCHAR(100) DEFAULT NULL,
    `title`          VARCHAR(200) NOT NULL,
    `content`        TEXT,
    `current_step`   INT          DEFAULT 0,
    `total_steps`    INT          DEFAULT 0,
    `status`         VARCHAR(20)  DEFAULT 'pending',
    `biz_type`       VARCHAR(50)  DEFAULT NULL,
    `biz_id`         VARCHAR(64)  DEFAULT NULL,
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `finish_time`    DATETIME     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_applicant` (`applicant_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流实例';

CREATE TABLE IF NOT EXISTS `sys_workflow_task` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT,
    `instance_id`   BIGINT       NOT NULL,
    `step`          INT          NOT NULL,
    `approver_id`   BIGINT       NOT NULL,
    `approver_name` VARCHAR(100) DEFAULT NULL,
    `action`        VARCHAR(20)  NOT NULL,
    `comment`       TEXT,
    `approve_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流审批任务';

-- 给 login_log 表添加 location 字段
ALTER TABLE `sys_login_log` ADD COLUMN `location` VARCHAR(100) DEFAULT NULL COMMENT '登录地点' AFTER `ip`;
