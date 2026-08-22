package com.vben.backend.module.auth.service;

import java.util.concurrent.ConcurrentHashMap;

/** 二维码登录会话（内存态，生产可迁移 Redis/Tair）。
 * ticket 唯一标识一次登录请求，前端轮询 status。 */
public class QrSession {

    public static final ConcurrentHashMap<String, QrSession> SESSIONS = new ConcurrentHashMap<>();

    private final String ticket;

    private String status;

    private Long loginUserId;

    private String accessToken;

    public QrSession(String ticket) {
        this.ticket = ticket;
        this.status = "pending";
    }

    public String getTicket() {
        return ticket;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getLoginUserId() {
        return loginUserId;
    }

    public void setLoginUserId(Long loginUserId) {
        this.loginUserId = loginUserId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}