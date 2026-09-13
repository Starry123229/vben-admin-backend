package com.vben.backend.module.system.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysOperationLog;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysOperationLogMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

/**
 * 操作日志切面：拦截带 @Log 注解的方法，自动记录操作日志。
 *
 * @author Starry
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    private final SysOperationLogMapper operationLogMapper;
    private final SysUserMapper userMapper;

    @Around("@annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        long startTime = System.currentTimeMillis();
        SysOperationLog logRecord = new SysOperationLog();
        logRecord.setModule(logAnnotation.module());
        logRecord.setDescription(logAnnotation.description());
        logRecord.setCreateTime(LocalDateTime.now());

        // 获取请求信息
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                logRecord.setRequestUrl(request.getRequestURI());
                logRecord.setRequestMethod(request.getMethod());
                logRecord.setIp(getClientIp(request));
            }
        } catch (Exception e) {
            // 忽略请求信息获取失败
        }

        // 获取方法名
        logRecord.setMethod(joinPoint.getSignature().getDeclaringTypeName()
                + "." + joinPoint.getSignature().getName());

        // 序列化请求参数
        try {
            StringBuilder sb = new StringBuilder();
            for (Object arg : joinPoint.getArgs()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(String.valueOf(arg));
            }
            String params = sb.toString();
            logRecord.setRequestParams(params.length() > 2000 ? params.substring(0, 2000) : params);
        } catch (Exception e) {
            logRecord.setRequestParams("参数序列化失败");
        }

        // 尝试获取当前登录用户
        try {
            if (StpUtil.isLogin()) {
                logRecord.setUserId(StpUtil.getLoginIdAsLong());
                // 从 session 获取用户名，如果为空则尝试从数据库查询
                String username = (String) StpUtil.getSession().get("username");
                if (username == null || username.isEmpty()) {
                    SysUser user =
                            userMapper.selectById(StpUtil.getLoginIdAsLong());
                    if (user != null) {
                        username = user.getUsername();
                    }
                }
                logRecord.setUsername(username);
            }
        } catch (Exception e) {
            // 忽略用户信息获取失败
        }

        Object result;
        try {
            // 执行目标方法
            result = joinPoint.proceed();
            logRecord.setStatus(1);
        } catch (Throwable e) {
            logRecord.setStatus(0);
            logRecord.setErrorMsg(e.getMessage() != null
                    ? (e.getMessage().length() > 2000 ? e.getMessage().substring(0, 2000) : e.getMessage())
                    : e.getClass().getSimpleName());
            throw e;
        } finally {
            logRecord.setCostTime(System.currentTimeMillis() - startTime);
            try {
                operationLogMapper.insert(logRecord);
            } catch (Exception e) {
                log.error("操作日志记录失败", e);
            }
        }
        return result;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多层代理取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        // IPv6 localhost 转换为 IPv4
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }
}
