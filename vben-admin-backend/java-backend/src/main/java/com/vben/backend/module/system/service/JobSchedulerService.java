package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysJob;
import com.vben.backend.module.system.mapper.SysJobMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * 定时任务调度引擎：基于 Spring Scheduling 的 CronTrigger 实现动态任务调度。
 *
 * <p>功能：
 * <ul>
 *   <li>启动时从数据库加载所有启用的任务并注册调度</li>
 *   <li>支持新增/删除/暂停/恢复/立即执行</li>
 *   <li>通过反射调用 Bean 方法（invokeTarget 格式：beanName.methodName 或 className.methodName）</li>
 * </ul>
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobSchedulerService implements SchedulingConfigurer {

    private final SysJobMapper jobMapper;
    private final ApplicationContext applicationContext;

    /** 已注册的调度任务，key=jobId */
    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    /**
     * 启动时加载所有启用的任务。
     */
    @PostConstruct
    public void init() {
        List<SysJob> jobs = jobMapper.selectList(
                new LambdaQueryWrapper<SysJob>().eq(SysJob::getStatus, 1));
        for (SysJob job : jobs) {
            try {
                scheduleJob(job);
            } catch (Exception e) {
                log.error("启动定时任务失败 [{}]: {}", job.getName(), e.getMessage());
            }
        }
        log.info("定时任务调度引擎已启动，已加载 {} 个任务", scheduledTasks.size());
    }

    /**
     * 关闭时清理所有调度任务。
     */
    @PreDestroy
    public void destroy() {
        for (ScheduledFuture<?> future : scheduledTasks.values()) {
            future.cancel(false);
        }
        scheduledTasks.clear();
        log.info("定时任务调度引擎已关闭");
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        // 动态注册由 init() 和 scheduleJob() 直接管理
    }

    /**
     * 调度单个任务。
     */
    public synchronized void scheduleJob(SysJob job) {
        // 先取消已有调度
        cancelJob(job.getId());

        if (job.getStatus() == null || job.getStatus() != 1) {
            return;
        }

        try {
            Runnable task = () -> executeJob(job);
            CronTrigger trigger = new CronTrigger(job.getCron());

            // 使用 Spring 的 ThreadPoolTaskScheduler
            org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler scheduler = getScheduler();
            ScheduledFuture<?> future = scheduler.schedule(task, trigger);
            scheduledTasks.put(job.getId(), future);
            log.info("定时任务 [{}] 已注册，cron={}", job.getName(), job.getCron());
        } catch (Exception e) {
            log.error("注册定时任务 [{}] 失败: {}", job.getName(), e.getMessage());
            throw ServiceException.badRequest("注册定时任务失败: " + e.getMessage());
        }
    }

    /**
     * 取消单个任务调度。
     */
    public synchronized void cancelJob(Long jobId) {
        ScheduledFuture<?> future = scheduledTasks.remove(jobId);
        if (future != null) {
            future.cancel(false);
            log.info("定时任务 [{}] 已取消", jobId);
        }
    }

    /**
     * 立即执行一次任务。
     */
    public void runOnce(SysJob job) {
        executeJob(job);
    }

    /**
     * 执行任务：通过反射调用目标方法。
     */
    private void executeJob(SysJob job) {
        long start = System.currentTimeMillis();
        log.info("开始执行定时任务 [{}]: invokeTarget={}", job.getName(), job.getInvokeTarget());
        try {
            String invokeTarget = job.getInvokeTarget();
            if (invokeTarget == null || invokeTarget.isBlank()) {
                log.warn("任务 [{}] 的 invokeTarget 为空，跳过", job.getName());
                return;
            }

            // 解析 invokeTarget：格式为 beanName.methodName
            String[] parts = invokeTarget.split("\\.", 2);
            if (parts.length != 2) {
                log.error("任务 [{}] 的 invokeTarget 格式错误，应为 beanName.methodName", job.getName());
                return;
            }

            String beanName = parts[0];
            String methodName = parts[1];

            Object bean;
            try {
                bean = applicationContext.getBean(beanName);
            } catch (Exception e) {
                // 尝试按类名查找
                try {
                    Class<?> clazz = Class.forName(beanName);
                    bean = applicationContext.getBean(clazz);
                } catch (Exception ex) {
                    throw new RuntimeException("无法找到 Bean: " + beanName);
                }
            }

            Method method = ReflectionUtils.findMethod(bean.getClass(), methodName);
            if (method == null) {
                throw new RuntimeException("无法找到方法: " + methodName + " 在 " + bean.getClass().getName());
            }

            ReflectionUtils.makeAccessible(method);
            method.invoke(bean);

            long cost = System.currentTimeMillis() - start;
            log.info("定时任务 [{}] 执行成功，耗时 {}ms", job.getName(), cost);

        } catch (Exception e) {
            long cost = System.currentTimeMillis() - start;
            log.error("定时任务 [{}] 执行失败，耗时 {}ms: {}", job.getName(), cost, e.getMessage(), e);
        }
    }

    private org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler getScheduler() {
        return (org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler)
                applicationContext.getBean("taskScheduler");
    }
}
