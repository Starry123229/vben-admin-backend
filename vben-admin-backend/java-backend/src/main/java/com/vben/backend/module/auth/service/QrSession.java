package com.vben.backend.module.auth.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 二维码登录会话（Redis 存储，多实例共享）。
 * ticket 唯一标识一次登录请求，前端轮询 status。
 *
 * @author Starry
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrSession implements Serializable {

    private String ticket;
    private String status;
    private Long loginUserId;
    private String accessToken;

    public QrSession(String ticket) {
        this.ticket = ticket;
        this.status = "pending";
    }
}
