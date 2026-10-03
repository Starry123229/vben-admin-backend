package com.vben.backend.module.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;

/**
 * 二维码登录会话 Redis 存储。
 * ticket → QrSession（JSON 序列化），TTL 5 分钟，多实例共享。
 *
 * @author Starry
 */
@Component
@RequiredArgsConstructor
public class QrSessionStore {

    private static final long EXPIRE_SECONDS = 5 * 60L;
    private static final String KEY_PREFIX = "vben:qr:ticket:";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 创建并存储二维码会话 */
    public void put(QrSession session) {
        String json = objectMapper.writeValueAsString(session);
        stringRedisTemplate.opsForValue().set(KEY_PREFIX + session.getTicket(), json, Duration.ofSeconds(EXPIRE_SECONDS));
    }

    /** 获取二维码会话 */
    public QrSession get(String ticket) {
        String json = stringRedisTemplate.opsForValue().get(KEY_PREFIX + ticket);
        if (json == null) {
            return null;
        }
        return objectMapper.readValue(json, QrSession.class);
    }

    /** 更新二维码会话（刷新 TTL） */
    public void update(QrSession session) {
        put(session);
    }

    /** 删除二维码会话 */
    public void remove(String ticket) {
        stringRedisTemplate.delete(KEY_PREFIX + ticket);
    }
}
