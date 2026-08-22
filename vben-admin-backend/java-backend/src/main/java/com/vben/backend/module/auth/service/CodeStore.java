package com.vben.backend.module.auth.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 一次性验证码内存存储（开发期跑通用；生产可替换为 Redis）。
 * 用于：手机短信验证码、忘记密码邮箱验证码。
 *
 * @author Starry
 */
@Component
public class CodeStore {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRE_MS = 5 * 60 * 1000L;

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    /** 生成并保存 6 位验证码，返回明文（开发期经 mock 通道回显） */
    public String put(String key) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        store.put(key, new Entry(code, System.currentTimeMillis() + EXPIRE_MS));
        return code;
    }

    /** 校验验证码（成功后即作废）。key 不存在/过期/不匹配均返回 false。 */
    public boolean verify(String key, String code) {
        Entry entry = store.get(key);
        if (entry == null || entry.expireAt < System.currentTimeMillis()) {
            store.remove(key);
            return false;
        }
        if (!entry.code.equals(code)) {
            return false;
        }
        store.remove(key);
        return true;
    }

    private record Entry(String code, long expireAt) {}
}