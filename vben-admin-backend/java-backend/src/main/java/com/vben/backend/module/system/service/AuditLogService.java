package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import tools.jackson.databind.ObjectMapper;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.module.system.entity.SysAuditLog;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysAuditLogMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * 审计日志服务：记录数据变更前后的对比。
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final SysAuditLogMapper auditLogMapper;
    private final SysUserMapper userMapper;
    private final ObjectMapper objectMapper;

    /**
     * 记录审计日志。
     *
     * @param module     操作模块
     * @param operation  操作类型（CREATE/UPDATE/DELETE）
     * @param entityType 实体类型
     * @param entityId   实体 ID
     * @param oldData    变更前对象
     * @param newData    变更后对象
     */
    public void record(String module, String operation, String entityType, String entityId,
                       Object oldData, Object newData) {
        try {
            SysAuditLog log = new SysAuditLog();
            log.setModule(module);
            log.setOperation(operation);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setCreateTime(LocalDateTime.now());

            // 获取操作人信息
            if (StpUtil.isLogin()) {
                long userId = StpUtil.getLoginIdAsLong();
                log.setUserId(userId);
                SysUser user = userMapper.selectById(userId);
                if (user != null) {
                    log.setUsername(user.getUsername());
                }
            } else {
                log.setUserId(0L);
                log.setUsername("system");
            }

            // 获取 IP
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                log.setIp(getClientIp(request));
            }

            // 序列化数据
            log.setOldData(oldData != null ? objectMapper.writeValueAsString(oldData) : null);
            log.setNewData(newData != null ? objectMapper.writeValueAsString(newData) : null);

            // 计算变更字段
            if (oldData != null && newData != null) {
                log.setChangedFields(computeDiff(oldData, newData));
            }

            auditLogMapper.insert(log);
        } catch (Exception e) {
            AuditLogService.log.error("记录审计日志失败", e);
        }
    }

    /**
     * 分页查询审计日志。
     */
    public PageResult<SysAuditLog> list(int page, int pageSize, String module, String entityType, String operation) {
        LambdaQueryWrapper<SysAuditLog> w = new LambdaQueryWrapper<SysAuditLog>()
                .orderByDesc(SysAuditLog::getCreateTime);
        if (module != null && !module.isBlank()) w.eq(SysAuditLog::getModule, module);
        if (entityType != null && !entityType.isBlank()) w.eq(SysAuditLog::getEntityType, entityType);
        if (operation != null && !operation.isBlank()) w.eq(SysAuditLog::getOperation, operation);
        IPage<SysAuditLog> p = auditLogMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    /**
     * 计算两个对象之间的字段差异。
     */
    @SuppressWarnings("unchecked")
    private String computeDiff(Object oldObj, Object newObj) {
        try {
            Map<String, Object> oldMap = objectMapper.convertValue(oldObj, Map.class);
            Map<String, Object> newMap = objectMapper.convertValue(newObj, Map.class);

            Set<String> allKeys = new TreeMap<>(oldMap).keySet();
            allKeys.addAll(newMap.keySet());

            return allKeys.stream()
                    .filter(k -> {
                        Object o = oldMap.get(k);
                        Object n = newMap.get(k);
                        return (o == null ? n != null : !o.equals(n));
                    })
                    .map(k -> {
                        Object o = oldMap.get(k);
                        Object n = newMap.get(k);
                        return k + ": " + o + " → " + n;
                    })
                    .collect(Collectors.joining("; "));
        } catch (Exception e) {
            return "diff computation error: " + e.getMessage();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null && ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
