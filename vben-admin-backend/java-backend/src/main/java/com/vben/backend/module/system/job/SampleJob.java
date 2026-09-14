package com.vben.backend.module.system.job;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 示例定时任务 Bean。
 * invokeTarget 填写：sampleJob.run（对应 beanName.methodName）
 *
 * @author Starry
 */
@Slf4j
@Component("sampleJob")
public class SampleJob {

    /**
     * 示例任务：每 5 分钟执行一次
     */
    public void run() {
        log.info("[示例任务] SampleJob.run() 执行成功，可以替换为你的业务逻辑");
    }

    /**
     * 示例任务：清理过期日志
     */
    public void cleanExpiredLogs() {
        log.info("[示例任务] cleanExpiredLogs() 执行：模拟清理30天前的操作日志");
    }
}
