package com.vben.backend.module.system.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;

/**
 * 系统状态检查定时任务 Bean。
 * invokeTarget 填写：systemMonitorTask.checkStatus（对应 beanName.methodName）
 *
 * @author Starry
 */
@Slf4j
@Component("systemMonitorTask")
@RequiredArgsConstructor
public class SystemMonitorTask {

    private final DataSource dataSource;

    /**
     * 检查系统状态：数据库连通性 + JVM 内存使用率 + 运行时长。
     */
    public void checkStatus() {
        // 1. 数据库连通性检查
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(3);
            if (valid) {
                log.info("[系统状态检查] 数据库连接正常");
            } else {
                log.warn("[系统状态检查] 数据库连接无效");
            }
        } catch (Exception e) {
            log.error("[系统状态检查] 数据库连接异常: {}", e.getMessage());
        }

        // 2. JVM 堆内存检查
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heap = memoryBean.getHeapMemoryUsage();
        long usedMb = heap.getUsed() / 1024 / 1024;
        long maxMb = heap.getMax() / 1024 / 1024;
        double usage = heap.getMax() > 0 ? (double) heap.getUsed() / heap.getMax() * 100 : 0;
        log.info("[系统状态检查] JVM 堆内存使用: {}MB / {}MB ({}%)",
                usedMb, maxMb, String.format("%.1f", usage));
        if (usage > 90) {
            log.warn("[系统状态检查] JVM 堆内存使用率超过 90%，请注意排查内存泄漏风险");
        }

        // 3. 运行时长
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        long uptimeMinutes = runtimeBean.getUptime() / 1000 / 60;
        log.info("[系统状态检查] 系统已运行 {} 分钟，检查完成", uptimeMinutes);
    }
}
