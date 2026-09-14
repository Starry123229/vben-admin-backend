package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.entity.SysAuditLog;
import com.vben.backend.module.system.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 审计日志接口（/system/audit-log/**）。
 * 仅超级管理员/管理员可访问。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/audit-log")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class AuditLogController {

    private final AuditLogService auditLogService;

    /** 分页查询审计日志 */
    @GetMapping("/list")
    public R<PageResult<SysAuditLog>> list(@RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "10") int pageSize,
                                            @RequestParam(required = false) String module,
                                            @RequestParam(required = false) String entityType,
                                            @RequestParam(required = false) String operation) {
        return R.ok(auditLogService.list(page, pageSize, module, entityType, operation));
    }
}
