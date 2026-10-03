package com.vben.backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * Redis 配置。
 *
 * <p>Sa-Token 1.46.0 使用 sa-token-redis-template 自动注册 SaTokenDao，
 * 内部序列化由 sa-token-jackson3 (Jackson 3.x / tools.jackson) 处理，
 * 与 Spring Boot 4.x 的 Jackson 版本一致，无需额外配置。
 *
 * <p>业务缓存统一使用 StringRedisTemplate + 手动 JSON 序列化，
 * 避免任何类型信息冲突。StringRedisTemplate 由 Spring Boot Data Redis 自动配置。
 *
 * @author Starry
 */
@Configuration
public class RedisConfig {
    // Spring Boot 自动配置 StringRedisTemplate，无需自定义 Bean
}
