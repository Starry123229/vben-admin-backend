package com.vben.backend.module.auth.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 刷新令牌实体，对应表 sys_refresh_token（存哈希不存原文，支持轮换吊销）。
 *
 * @author Starry
 */
@Data
@TableName("sys_refresh_token")
public class SysRefreshToken {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户 ID */
    private Long userId;

    /** token 的 SHA-256 哈希 */
    private String tokenHash;

    /** 过期时间 */
    private LocalDateTime expiresAt;

    /** 是否已作废：0 否 / 1 是 */
    private Integer revoked;

    private LocalDateTime createdAt;
}
