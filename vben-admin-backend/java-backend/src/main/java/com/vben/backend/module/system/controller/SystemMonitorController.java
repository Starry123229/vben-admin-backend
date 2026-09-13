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

        // 使用 oshi 获取 CPU 和内存
        try {
            SystemInfo si = new SystemInfo();
            HardwareAbstractionLayer hal = si.getHardware();
            CentralProcessor processor = hal.getProcessor();
            GlobalMemory memory = hal.getMemory();

            Map<String, Object> cpu = new HashMap<>();
            cpu.put("name", processor.getProcessorIdentifier().getName());
            cpu.put("logicalCores", processor.getLogicalProcessorCount());
            cpu.put("physicalCores", processor.getPhysicalProcessorCount());
            cpu.put("systemLoad", String.format("%.2f", processor.getSystemCpuLoad(100) * 100));
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
