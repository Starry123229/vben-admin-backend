package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import tools.jackson.databind.ObjectMapper;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.*;
import com.vben.backend.module.system.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 轻量级工作流引擎：基于状态机 + 审批链实现。
 *
 * <p>流程定义 JSON 格式：
 * <pre>
 * [
 *   {"step": 0, "name": "直属领导审批", "approverId": 2},
 *   {"step": 1, "name": "部门经理审批", "approverId": 3}
 * ]
 * </pre>
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final SysWorkflowMapper workflowMapper;
    private final SysWorkflowInstanceMapper instanceMapper;
    private final SysWorkflowTaskMapper taskMapper;
    private final SysUserMapper userMapper;
    private final ObjectMapper objectMapper;

    // ==================== 流程定义管理 ====================

    public PageResult<SysWorkflow> listWorkflows(int page, int pageSize, String name) {
        LambdaQueryWrapper<SysWorkflow> w = new LambdaQueryWrapper<SysWorkflow>()
                .orderByDesc(SysWorkflow::getCreateTime);
        if (name != null && !name.isBlank()) {
            w.like(SysWorkflow::getName, name);
        }
        IPage<SysWorkflow> p = workflowMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    @Transactional
    public Long createWorkflow(SysWorkflow workflow) {
        if (workflow.getName() == null || workflow.getName().isBlank()) {
            throw ServiceException.badRequest("流程名称不能为空");
        }
        if (workflow.getCode() == null || workflow.getCode().isBlank()) {
            throw ServiceException.badRequest("流程编码不能为空");
        }
        workflow.setStatus(1);
        workflow.setCreateTime(LocalDateTime.now());
        // 验证流程定义 JSON 格式
        if (workflow.getDefinition() != null && !workflow.getDefinition().isBlank()) {
            parseApprovalSteps(workflow.getDefinition());
        }
        workflowMapper.insert(workflow);
        return workflow.getId();
    }

    @Transactional
    public void updateWorkflow(SysWorkflow workflow) {
        workflowMapper.updateById(workflow);
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        if (id == null || workflowMapper.selectById(id) == null) {
            throw ServiceException.badRequest("工作流定义不存在");
        }
        workflowMapper.deleteById(id);
    }

    // ==================== 流程实例管理 ====================

    /**
     * 发起工作流（创建审批申请）。
     */
    @Transactional
    public Long startInstance(Long workflowId, String title, String content, String bizType, String bizId) {
        SysWorkflow workflow = workflowMapper.selectById(workflowId);
        if (workflow == null) {
            throw ServiceException.badRequest("工作流定义不存在");
        }
        if (workflow.getStatus() != 1) {
            throw ServiceException.badRequest("工作流未启用");
        }

        // 解析审批链
        int totalSteps = parseApprovalSteps(workflow.getDefinition()).size();

        long userId = StpUtil.getLoginIdAsLong();
        SysUser user = userMapper.selectById(userId);

        SysWorkflowInstance instance = new SysWorkflowInstance();
        instance.setWorkflowId(workflowId);
        instance.setWorkflowName(workflow.getName());
        instance.setApplicantId(userId);
        instance.setApplicantName(user != null ? user.getUsername() : "");
        instance.setTitle(title);
        instance.setContent(content);
        instance.setCurrentStep(0);
        instance.setTotalSteps(totalSteps);
        instance.setStatus("pending");
        instance.setBizType(bizType);
        instance.setBizId(bizId);
        instance.setCreateTime(LocalDateTime.now());
        instanceMapper.insert(instance);

        log.info("工作流实例已创建: workflow={}, instance={}, applicant={}",
                workflow.getName(), instance.getId(), instance.getApplicantName());
        return instance.getId();
    }

    /**
     * 审批（通过/驳回）。
     */
    @Transactional
    public void approve(Long instanceId, String action, String comment) {
        SysWorkflowInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw ServiceException.badRequest("审批实例不存在");
        }
        if (!"pending".equals(instance.getStatus())) {
            throw ServiceException.badRequest("该审批已完成，无法继续操作");
        }

        long userId = StpUtil.getLoginIdAsLong();
        SysUser user = userMapper.selectById(userId);

        // 记录审批任务
        SysWorkflowTask task = new SysWorkflowTask();
        task.setInstanceId(instanceId);
        task.setStep(instance.getCurrentStep());
        task.setApproverId(userId);
        task.setApproverName(user != null ? user.getUsername() : "");
        task.setAction(action);
        task.setComment(comment);
        task.setApproveTime(LocalDateTime.now());
        taskMapper.insert(task);

        if ("approve".equals(action)) {
            // 通过：推进到下一步
            int nextStep = instance.getCurrentStep() + 1;
            if (nextStep >= instance.getTotalSteps()) {
                // 最后一步通过 → 整体通过
                instance.setStatus("approved");
                instance.setFinishTime(LocalDateTime.now());
            } else {
                instance.setCurrentStep(nextStep);
            }
        } else if ("reject".equals(action)) {
            // 驳回：整体驳回
            instance.setStatus("rejected");
            instance.setFinishTime(LocalDateTime.now());
        }
        instanceMapper.updateById(instance);

        log.info("审批操作: instance={}, action={}, approver={}", instanceId, action, task.getApproverName());
    }

    /**
     * 撤回申请（仅申请人本人，且状态为 pending）。
     */
    @Transactional
    public void cancelInstance(Long instanceId) {
        SysWorkflowInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw ServiceException.badRequest("审批实例不存在");
        }
        long userId = StpUtil.getLoginIdAsLong();
        if (!instance.getApplicantId().equals(userId)) {
            throw ServiceException.badRequest("只能撤回自己的申请");
        }
        if (!"pending".equals(instance.getStatus())) {
            throw ServiceException.badRequest("已完成审批无法撤回");
        }
        instance.setStatus("cancelled");
        instance.setFinishTime(LocalDateTime.now());
        instanceMapper.updateById(instance);
    }

    /**
     * 分页查询审批实例（当前用户可见的）。
     */
    public PageResult<SysWorkflowInstance> listInstances(int page, int pageSize, String status) {
        long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<SysWorkflowInstance> w = new LambdaQueryWrapper<SysWorkflowInstance>()
                .and(q -> q.eq(SysWorkflowInstance::getApplicantId, userId)
                        .or().exists("SELECT 1 FROM sys_workflow_task t WHERE t.instance_id = id AND t.approver_id = " + userId))
                .orderByDesc(SysWorkflowInstance::getCreateTime);
        if (status != null && !status.isBlank()) {
            w.eq(SysWorkflowInstance::getStatus, status);
        }
        IPage<SysWorkflowInstance> p = instanceMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    /**
     * 查询审批实例的审批记录。
     */
    public List<SysWorkflowTask> listTasks(Long instanceId) {
        return taskMapper.selectList(
                new LambdaQueryWrapper<SysWorkflowTask>()
                        .eq(SysWorkflowTask::getInstanceId, instanceId)
                        .orderByAsc(SysWorkflowTask::getStep));
    }

    /**
     * 解析审批步骤定义。
     */
    @SuppressWarnings("unchecked")
    private List<java.util.Map<String, Object>> parseApprovalSteps(String definition) {
        try {
            return objectMapper.readValue(definition, List.class);
        } catch (Exception e) {
            log.error("解析流程定义失败", e);
            throw ServiceException.badRequest("流程定义格式错误");
        }
    }
}
