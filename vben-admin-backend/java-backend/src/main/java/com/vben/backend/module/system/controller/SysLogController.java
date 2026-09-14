package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.service.SysLogService;
import com.vben.backend.module.system.util.ExcelUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    /** DELETE /system/log/operation：清空操作日志（super/admin） */
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    @DeleteMapping("/operation")
    public R<Void> clearOperation() {
        logService.clearOperationLogs();
        return R.ok();
    }

    /** GET /system/log/operation/export：导出操作日志 Excel */
    @Log(module = "操作日志", description = "导出操作日志")
    @GetMapping("/operation/export")
    public void exportOperation(HttpServletResponse response,
                                @RequestParam(required = false) String username,
                                @RequestParam(required = false) String module,
                                @RequestParam(required = false) Integer status,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) throws IOException {
        List<Map<String, Object>> data = logService.operationExportData(username, module, status, startTime, endTime);
        List<String> headers = List.of("ID", "用户名", "模块", "描述", "请求方法", "请求URL", "IP", "状态", "错误信息", "耗时(ms)", "操作时间");
        ExcelUtils.export(response, "操作日志", headers, data);
    }

    /** DELETE /system/log/login：清空登录日志（super/admin） */
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    @DeleteMapping("/login")
    public R<Void> clearLogin() {
        logService.clearLoginLogs();
        return R.ok();
    }

    /** GET /system/log/login/export：导出登录日志 Excel */
    @Log(module = "登录日志", description = "导出登录日志")
    @GetMapping("/login/export")
    public void exportLogin(HttpServletResponse response,
                            @RequestParam(required = false) String username,
                            @RequestParam(required = false) Integer status,
                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) throws IOException {
        List<Map<String, Object>> data = logService.loginExportData(username, status, startTime, endTime);
        List<String> headers = List.of("ID", "用户名", "IP", "登录地点", "浏览器", "操作系统", "状态", "提示消息", "登录方式", "登录时间");
        ExcelUtils.export(response, "登录日志", headers, data);
    }
}
