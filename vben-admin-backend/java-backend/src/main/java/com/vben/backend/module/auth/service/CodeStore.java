package com.vben.backend.module.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;

/**
 * 一次性验证码 Redis 存储。
 * 用于：手机短信验证码、忘记密码邮箱验证码。
 * 多实例共享，自动 TTL 过期。
 *
 * @author Starry
 */
@Component
@RequiredArgsConstructor
public class CodeStore {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRE_SECONDS = 5 * 60L;

    private final StringRedisTemplate redis;

    /** 生成并保存 6 位验证码，返回明文（开发期经 mock 通道回显） */
    public String put(String key) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redis.opsForValue().set("vben:code:" + key, code, Duration.ofSeconds(EXPIRE_SECONDS));
        return code;
    }

    /** 校验验证码（成功后即作废）。key 不存在/过期/不匹配均返回 false。 */
    public boolean verify(String key, String code) {
        String stored = redis.opsForValue().get("vben:code:" + key);
        if (stored == null || !stored.equals(code)) {
            return false;
        }
        redis.delete("vben:code:" + key);
        return true;
    }
}
