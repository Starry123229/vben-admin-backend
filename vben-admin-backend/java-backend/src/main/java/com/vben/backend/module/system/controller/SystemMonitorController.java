package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import lombok.RequiredArgsConstructor;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 系统监控接口（/system/monitor/**）。
 * 提供 CPU、内存、JVM、磁盘等运行时信息。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/monitor")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SystemMonitorController {

    /**
     * 缓存 oshi 单例，避免每次请求重建实例导致 CPU tick 基准丢失。
     */
    private static final SystemInfo CACHED_SI = new SystemInfo();
    private static final HardwareAbstractionLayer CACHED_HAL = CACHED_SI.getHardware();
    private static final CentralProcessor CACHED_PROCESSOR = CACHED_HAL.getProcessor();

    /**
     * 后台定时采样 CPU 负载，避免在 HTTP 请求线程中阻塞。
     * oshi 的 getSystemCpuLoad(delay) 需要两次 tick 之间有足够间隔，
     * 首次调用永远返回 0（无历史基准），因此用后台线程持续采样。
     */
    private static final AtomicReference<Double> CACHED_CPU_LOAD = new AtomicReference<>(0.0);

    static {
        // 启动后台线程，每 2 秒采样一次 CPU 负载
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "cpu-load-sampler");
            t.setDaemon(true);
            return t;
        });
        scheduler.scheduleAtFixedRate(() -> {
            try {
                // getSystemCpuLoad(500) 阻塞 500ms 采样两次 tick 并计算差值
                double load = CACHED_PROCESSOR.getSystemCpuLoad(500) * 100;
                if (load >= 0) {
                    CACHED_CPU_LOAD.set(load);
                }
            } catch (Exception ignored) {
                // 采样失败时保留上一次的值
            }
        }, 0, 2, TimeUnit.SECONDS);
    }

    @GetMapping("/server")
    public R<Map<String, Object>> serverInfo() {
        Map<String, Object> data = new HashMap<>();

        // JVM 信息
        Runtime runtime = Runtime.getRuntime();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        Map<String, Object> jvm = new HashMap<>();
        jvm.put("maxMemory", runtime.maxMemory());
        jvm.put("totalMemory", runtime.totalMemory());
        jvm.put("freeMemory", runtime.freeMemory());
        jvm.put("usedMemory", runtime.totalMemory() - runtime.freeMemory());
        jvm.put("startTime", runtimeBean.getStartTime());
        jvm.put("uptime", runtimeBean.getUptime());
        jvm.put("jvmName", runtimeBean.getVmName());
        jvm.put("jvmVersion", runtimeBean.getVmVersion());
        jvm.put("javaVersion", System.getProperty("java.version"));
        data.put("jvm", jvm);

        // 系统信息
        Map<String, Object> sysInfo = new HashMap<>();
        sysInfo.put("osName", System.getProperty("os.name"));
        sysInfo.put("osArch", System.getProperty("os.arch"));
        sysInfo.put("osVersion", System.getProperty("os.version"));
        sysInfo.put("processors", runtime.availableProcessors());
        sysInfo.put("userDir", System.getProperty("user.dir"));
        data.put("sys", sysInfo);

        // 使用缓存的 oshi 实例获取 CPU 和内存
        try {
            GlobalMemory memory = CACHED_HAL.getMemory();

            Map<String, Object> cpu = new HashMap<>();
            cpu.put("name", CACHED_PROCESSOR.getProcessorIdentifier().getName());
            cpu.put("logicalCores", CACHED_PROCESSOR.getLogicalProcessorCount());
            cpu.put("physicalCores", CACHED_PROCESSOR.getPhysicalProcessorCount());
            cpu.put("systemLoad", String.format("%.2f", CACHED_CPU_LOAD.get()));
            data.put("cpu", cpu);

            Map<String, Object> mem = new HashMap<>();
            mem.put("total", memory.getTotal());
            mem.put("available", memory.getAvailable());
            mem.put("used", memory.getTotal() - memory.getAvailable());
            mem.put("usageRate", String.format("%.2f",
                    (double)(memory.getTotal() - memory.getAvailable()) / memory.getTotal() * 100));
            data.put("memory", mem);
        } catch (Exception e) {
            // oshi 不可用时忽略
            data.put("cpu", Map.of("error", "CPU信息不可用"));
            data.put("memory", Map.of("error", "内存信息不可用"));
        }

        return R.ok(data);
    }
}
