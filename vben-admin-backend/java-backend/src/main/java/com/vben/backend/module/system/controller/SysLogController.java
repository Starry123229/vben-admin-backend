package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.service.SysLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * 日志管理接口（/system/log/**）。
 * 仅 super/admin 可访问。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/log")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SysLogController {

    private final SysLogService logService;

    /** GET /system/log/operation/list：操作日志分页列表 */
    @GetMapping("/operation/list")
    public R<?> operationList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return R.ok(logService.operationList(page, pageSize, username, module, status, startTime, endTime));
    }

    /** GET /system/log/login/list：登录日志分页列表 */
    @GetMapping("/login/list")
    public R<?> loginList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return R.ok(logService.loginList(page, pageSize, username, status, startTime, endTime));
    }

    /** DELETE /system/log/operation：清空操作日志（仅 super） */
    @SaCheckRole("super")
    @DeleteMapping("/operation")
    public R<Void> clearOperation() {
        logService.clearOperationLogs();
        return R.ok();
    }

    /** DELETE /system/log/login：清空登录日志（仅 super） */
    @SaCheckRole("super")
    @DeleteMapping("/login")
    public R<Void> clearLogin() {
        logService.clearLoginLogs();
        return R.ok();
    }
}
