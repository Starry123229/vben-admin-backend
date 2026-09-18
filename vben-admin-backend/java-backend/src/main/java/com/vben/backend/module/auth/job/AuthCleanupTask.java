package com.vben.backend.module.auth.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.vben.backend.module.auth.entity.SysRefreshToken;
import com.vben.backend.module.auth.mapper.SysRefreshTokenMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 认证令牌清理定时任务 Bean。
 * invokeTarget 填写：authCleanupTask.cleanExpiredTokens（对应 beanName.methodName）
 *
 * @author Starry
 */
@Slf4j
@Component("authCleanupTask")
@RequiredArgsConstructor
public class AuthCleanupTask {

    private final SysRefreshTokenMapper refreshTokenMapper;

    /**
     * 清理已过期的刷新令牌（过期后即无效，定期物理删除避免表膨胀）。
     */
    public void cleanExpiredTokens() {
        int deleted = refreshTokenMapper.delete(
                new LambdaQueryWrapper<SysRefreshToken>()
                        .lt(SysRefreshToken::getExpiresAt, LocalDateTime.now()));
        log.info("[令牌清理] 已清理 {} 条过期刷新令牌", deleted);
    }
}
