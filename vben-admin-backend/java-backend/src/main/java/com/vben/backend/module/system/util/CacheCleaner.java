package com.vben.backend.module.system.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Redis 缓存清理工具：在用户/角色/菜单等数据变更时主动清除相关缓存。
 *
 * @author Starry
 */
@Component
@RequiredArgsConstructor
public class CacheCleaner {

    private final StringRedisTemplate stringRedisTemplate;

    /** 清除单个用户的全部缓存（用户信息、权限码、角色码） */
    public void evictUserCache(long userId) {
        stringRedisTemplate.delete("vben:user:info:" + userId);
        stringRedisTemplate.delete("vben:user:codes:" + userId);
        stringRedisTemplate.delete("vben:user:roles:" + userId);
    }

    /** 清除所有用户的权限码和角色码缓存（角色/菜单变更时批量清除） */
    public void evictAllPermissionCaches() {
        evictByPattern("vben:user:codes:*");
        evictByPattern("vben:user:roles:*");
    }

    /** 清除所有用户信息缓存（用户列表批量变更时） */
    public void evictAllUserInfoCaches() {
        evictByPattern("vben:user:info:*");
    }

    private void evictByPattern(String pattern) {
        Set<String> keys = stringRedisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }
}
