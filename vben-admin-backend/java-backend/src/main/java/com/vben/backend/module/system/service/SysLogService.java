package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.module.system.entity.SysLoginLog;
import com.vben.backend.module.system.entity.SysOperationLog;
import com.vben.backend.module.system.mapper.SysLoginLogMapper;
import com.vben.backend.module.system.mapper.SysOperationLogMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 日志服务：操作日志与登录日志的查询、清理。
 * 仅超级管理员/管理员可访问。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysLogService {

    private final SysOperationLogMapper operationLogMapper;
    private final SysLoginLogMapper loginLogMapper;
    private final SysUserMapper userMapper;

    /**
     * 操作日志分页列表。
     */
    public PageResult<SysOperationLog> operationList(int page, int pageSize,
                                                     String username, String module,
                                                     Integer status,
                                                     LocalDateTime startTime, LocalDateTime endTime) {
        Page<SysOperationLog> p = new Page<>(page, Math.min(pageSize, 100));
        LambdaQueryWrapper<SysOperationLog> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like(SysOperationLog::getUsername, username);
        }
        if (module != null && !module.isEmpty()) {
            wrapper.eq(SysOperationLog::getModule, module);
        }
        if (status != null) {
            wrapper.eq(SysOperationLog::getStatus, status);
        }
        if (startTime != null) {
            wrapper.ge(SysOperationLog::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(SysOperationLog::getCreateTime, endTime);
        }
        wrapper.orderByDesc(SysOperationLog::getCreateTime);
        IPage<SysOperationLog> result = operationLogMapper.selectPage(p, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    /**
     * 登录日志分页列表。
     */
    public PageResult<SysLoginLog> loginList(int page, int pageSize,
                                             String username, Integer status,
                                             LocalDateTime startTime, LocalDateTime endTime) {
        Page<SysLoginLog> p = new Page<>(page, Math.min(pageSize, 100));
        LambdaQueryWrapper<SysLoginLog> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like(SysLoginLog::getUsername, username);
        }
        if (status != null) {
            wrapper.eq(SysLoginLog::getStatus, status);
        }
        if (startTime != null) {
            wrapper.ge(SysLoginLog::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(SysLoginLog::getCreateTime, endTime);
        }
        wrapper.orderByDesc(SysLoginLog::getCreateTime);
        IPage<SysLoginLog> result = loginLogMapper.selectPage(p, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    /**
     * 记录登录日志（供 AuthService 调用）。
     */
    public void recordLogin(Long userId, String username, String ip,
                            String browser, String os, Integer status,
                            String message, String loginType) {
        SysLoginLog log = new SysLoginLog();
        log.setUserId(userId);
        log.setUsername(username);
        log.setIp(ip);
        log.setBrowser(browser);
        log.setOs(os);
        log.setStatus(status);
        log.setMessage(message);
        log.setLoginType(loginType);
        log.setCreateTime(LocalDateTime.now());
        loginLogMapper.insert(log);
    }

    /**
     * 清空操作日志（仅超级管理员）。
     */
    public void clearOperationLogs() {
        operationLogMapper.delete(null);
    }

    /**
     * 清空登录日志（仅超级管理员）。
     */
    public void clearLoginLogs() {
        loginLogMapper.delete(null);
    }
}
