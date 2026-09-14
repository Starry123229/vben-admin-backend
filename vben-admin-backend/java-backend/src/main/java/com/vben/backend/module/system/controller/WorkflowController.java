package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysWorkflow;
import com.vben.backend.module.system.entity.SysWorkflowInstance;
import com.vben.backend.module.system.entity.SysWorkflowTask;
import com.vben.backend.module.system.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工作流引擎接口（/system/workflow/**）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    // ==================== 流程定义 ====================

    @GetMapping("/list")
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<PageResult<SysWorkflow>> list(@RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "10") int pageSize,
                                            @RequestParam(required = false) String name) {
        return R.ok(workflowService.listWorkflows(page, pageSize, name));
    }

    @Log(module = "工作流", description = "新增流程定义")
    @PostMapping
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<Long> create(@RequestBody SysWorkflow workflow) {
        return R.ok(workflowService.createWorkflow(workflow));
    }

    @Log(module = "工作流", description = "编辑流程定义")
    @PutMapping("/{id}")
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<Void> update(@PathVariable Long id, @RequestBody SysWorkflow workflow) {
        if (workflow.getId() == null) workflow.setId(id);
        workflowService.updateWorkflow(workflow);
        return R.ok();
    }

    @Log(module = "工作流", description = "删除流程定义")
    @DeleteMapping("/{id}")
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<Void> delete(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return R.ok();
    }

    // ==================== 流程实例 ====================

    /** 发起审批
     * <p>前端通过 query params 传递参数（与 OpenAPI 文档一致）。</p> */
    @Log(module = "工作流", description = "发起审批")
    @PostMapping("/start")
    public R<Long> start(@RequestParam Long workflowId,
                        @RequestParam String title,
                        @RequestParam(required = false) String content,
                        @RequestParam(required = false) String bizType,
                        @RequestParam(required = false) String bizId) {
        return R.ok(workflowService.startInstance(workflowId, title, content, bizType, bizId));
    }

    /** 审批操作
     * <p>前端通过 query params 传递 action 和 comment（与 OpenAPI 文档一致）。</p> */
    @Log(module = "工作流", description = "审批操作")
    @PutMapping("/{instanceId}/approve")
    public R<Void> approve(@PathVariable Long instanceId,
                            @RequestParam(defaultValue = "approve") String action,
                            @RequestParam(required = false) String comment) {
        workflowService.approve(instanceId, action, comment);
        return R.ok();
    }

    /** 撤回申请 */
    @Log(module = "工作流", description = "撤回申请")
    @PutMapping("/{instanceId}/cancel")
    public R<Void> cancel(@PathVariable Long instanceId) {
        workflowService.cancelInstance(instanceId);
        return R.ok();
    }

    /** 我的审批列表 */
    @GetMapping("/instances")
    public R<PageResult<SysWorkflowInstance>> instances(@RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "10") int pageSize,
                                                         @RequestParam(required = false) String status) {
        return R.ok(workflowService.listInstances(page, pageSize, status));
    }

    /** 审批记录 */
    @GetMapping("/{instanceId}/tasks")
    public R<List<SysWorkflowTask>> tasks(@PathVariable Long instanceId) {
        return R.ok(workflowService.listTasks(instanceId));
    }
}
