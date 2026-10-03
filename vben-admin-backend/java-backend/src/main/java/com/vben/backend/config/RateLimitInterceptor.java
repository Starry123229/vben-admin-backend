package com.vben.backend.config;

import com.vben.backend.common.result.ServiceException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

/**
 * 登录限流拦截器：基于 Redis 计数，防止暴力破解（多实例共享）。
 * 限制：同一 IP 1分钟内最多 10 次登录请求。
 *
 * @author Starry
 */
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_SECONDS = 60L;

    private final StringRedisTemplate redis;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String uri = request.getRequestURI();
        if (!uri.contains("/auth/login") && !uri.contains("/auth/phone-login")) {
            return true;
        }

        String ip = getClientIp(request);
        String key = "vben:rate:login:" + ip;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
        }

        if (count != null && count > MAX_ATTEMPTS) {
            throw ServiceException.badRequest("登录尝试过于频繁，请1分钟后再试");
        }
        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "unknown";
    }
}
