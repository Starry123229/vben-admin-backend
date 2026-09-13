package com.vben.backend.config;

import com.vben.backend.common.result.ServiceException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 登录限流拦截器：基于内存计数，防止暴力破解。
 * 限制：同一 IP 1分钟内最多 10 次登录请求。
 *
 * @author Starry
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 60 * 1000L;

    private final Map<String, long[]> cache = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String uri = request.getRequestURI();
        if (!uri.contains("/auth/login") && !uri.contains("/auth/phone-login")) {
            return true;
        }

        String ip = getClientIp(request);
        long now = System.currentTimeMillis();
        long[] entry = cache.compute(ip, (k, v) -> {
            if (v == null || now - v[0] > WINDOW_MS) {
                return new long[]{now, 1};
            }
            v[1]++;
            return v;
        });

        if (entry[1] > MAX_ATTEMPTS) {
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
