package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.module.system.entity.SysLoginLog;
import com.vben.backend.module.system.entity.SysOperationLog;
import com.vben.backend.module.system.mapper.SysLoginLogMapper;
import com.vben.backend.module.system.mapper.SysOperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
     * 导出操作日志 Excel 数据（不分页，上限 10000 条）。
     */
    public List<Map<String, Object>> operationExportData(String username, String module,
                                                          Integer status,
                                                          LocalDateTime startTime, LocalDateTime endTime) {
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
        wrapper.last("LIMIT 10000");
        List<SysOperationLog> logs = operationLogMapper.selectList(wrapper);
        List<Map<String, Object>> data = new ArrayList<>();
        for (SysOperationLog log : logs) {
            Map<String, Object> row = new HashMap<>();
            row.put("ID", log.getId());
            row.put("用户名", log.getUsername() == null ? "" : log.getUsername());
            row.put("模块", log.getModule() == null ? "" : log.getModule());
            row.put("描述", log.getDescription() == null ? "" : log.getDescription());
            row.put("请求方法", log.getRequestMethod() == null ? "" : log.getRequestMethod());
            row.put("请求URL", log.getRequestUrl() == null ? "" : log.getRequestUrl());
            row.put("IP", log.getIp() == null ? "" : log.getIp());
            row.put("状态", log.getStatus() != null && log.getStatus() == 1 ? "成功" : "失败");
            row.put("错误信息", log.getErrorMsg() == null ? "" : log.getErrorMsg());
            row.put("耗时(ms)", log.getCostTime() == null ? "" : log.getCostTime());
            row.put("操作时间", log.getCreateTime() == null ? "" : log.getCreateTime().toString());
            data.add(row);
        }
        return data;
    }

    /**
     * 导出登录日志 Excel 数据（不分页，上限 10000 条）。
     */
    public List<Map<String, Object>> loginExportData(String username, Integer status,
                                                     LocalDateTime startTime, LocalDateTime endTime) {
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
        wrapper.last("LIMIT 10000");
        List<SysLoginLog> logs = loginLogMapper.selectList(wrapper);
        List<Map<String, Object>> data = new ArrayList<>();
        for (SysLoginLog log : logs) {
            Map<String, Object> row = new HashMap<>();
            row.put("ID", log.getId());
            row.put("用户名", log.getUsername() == null ? "" : log.getUsername());
            row.put("IP", log.getIp() == null ? "" : log.getIp());
            row.put("登录地点", log.getLocation() == null ? "" : log.getLocation());
            row.put("浏览器", log.getBrowser() == null ? "" : log.getBrowser());
            row.put("操作系统", log.getOs() == null ? "" : log.getOs());
            row.put("状态", log.getStatus() != null && log.getStatus() == 1 ? "成功" : "失败");
            row.put("提示消息", log.getMessage() == null ? "" : log.getMessage());
            row.put("登录方式", log.getLoginType() == null ? "" : log.getLoginType());
            row.put("登录时间", log.getCreateTime() == null ? "" : log.getCreateTime().toString());
            data.add(row);
        }
        return data;
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
