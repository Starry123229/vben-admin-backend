package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysJob;
import com.vben.backend.module.system.mapper.SysJobMapper;
import com.vben.backend.module.system.service.JobSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 定时任务管理（/system/job/**）。
 * 集成 Spring Scheduling 实现实际调度。
 *
 * @author Starry
 */
@Slf4j
@RestController
@RequestMapping("/system/job")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SysJobController {

    private final SysJobMapper jobMapper;
    private final JobSchedulerService jobScheduler;

    @GetMapping("/list")
    public R<List<SysJob>> list() {
        return R.ok(jobMapper.selectList(null));
    }

    @Log(module = "定时任务", description = "新增任务")
    @PostMapping
    public R<Long> create(@RequestBody SysJob job) {
        if (!StringUtils.hasText(job.getName())) {
            throw ServiceException.badRequest("任务名称不能为空");
        }
        if (!StringUtils.hasText(job.getInvokeTarget())) {
            throw ServiceException.badRequest("调用目标不能为空");
        }
        validateCron(job.getCron());
        jobMapper.insert(job);
        // 如果任务启用，立即注册调度
        if (job.getStatus() != null && job.getStatus() == 1) {
            jobScheduler.scheduleJob(job);
        }
        return R.ok(job.getId());
    }

    @Log(module = "定时任务", description = "编辑任务")
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysJob job) {
        if (job.getId() == null) job.setId(id);
        validateCron(job.getCron());
        jobMapper.updateById(job);
        // 重新注册调度
        SysJob updated = jobMapper.selectById(id);
        if (updated != null) {
            jobScheduler.scheduleJob(updated);
        }
        return R.ok();
    }

    @Log(module = "定时任务", description = "删除任务")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        SysJob job = jobMapper.selectById(id);
        if (job == null) {
            throw ServiceException.badRequest("任务不存在: " + id);
        }
        // 先取消调度
        jobScheduler.cancelJob(id);
        jobMapper.deleteById(id);
        return R.ok();
    }

    @Log(module = "定时任务", description = "切换任务状态")
    @PutMapping("/{id}/toggle")
    public R<Void> toggle(@PathVariable Long id) {
        SysJob job = jobMapper.selectById(id);
        if (job == null) {
            throw ServiceException.badRequest("任务不存在: " + id);
        }
        job.setStatus(job.getStatus() == 1 ? 0 : 1);
        jobMapper.updateById(job);
        // 启用 → 注册调度；停用 → 取消调度
        if (job.getStatus() == 1) {
            jobScheduler.scheduleJob(job);
        } else {
            jobScheduler.cancelJob(id);
        }
        return R.ok();
    }

    @Log(module = "定时任务", description = "立即执行一次")
    @PutMapping("/{id}/run")
    public R<Void> run(@PathVariable Long id) {
        SysJob job = jobMapper.selectById(id);
        if (job == null) {
            throw ServiceException.badRequest("任务不存在: " + id);
        }
        jobScheduler.runOnce(job);
        return R.ok();
    }

    /**
     * 校验 cron 表达式
     */
    private void validateCron(String cron) {
        if (cron == null || cron.isBlank()) {
            throw ServiceException.badRequest("cron 表达式不能为空");
        }
        try {
            new org.springframework.scheduling.support.CronTrigger(cron);
        } catch (Exception e) {
            throw ServiceException.badRequest("cron 表达式无效: " + e.getMessage());
        }
    }
}
