package com.vben.backend.config;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

/**
 * MyBatis-Plus 配置：分页插件 + 多租户插件（可选）。
 *
 * <p>多租户启用方式：在 application.yml 中设置 app.tenant.enabled=true
 *
 * @author Starry
 */
@Configuration
public class MybatisPlusConfig {

    @Value("${app.tenant.enabled:false}")
    private boolean tenantEnabled;

    /** 不需要租户隔离的表（全局表） */
    private static final List<String> IGNORE_TABLES = Arrays.asList(
            "sys_tenant", "sys_dict", "sys_dict_item", "sys_config",
            "sys_menu", "sys_role_menu", "sys_audit_log"
    );

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 多租户插件必须在分页插件之前
        if (tenantEnabled) {
            interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new VbenTenantHandler()));
        }
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }

    /**
     * 租户处理器：从当前登录用户 Session 获取 tenantId。
     */
    static class VbenTenantHandler implements TenantLineHandler {

        @Override
        public Expression getTenantId() {
            try {
                if (StpUtil.isLogin()) {
                    Object tenantId = StpUtil.getSession().get("tenantId");
                    if (tenantId != null) {
                        return new LongValue(((Number) tenantId).longValue());
                    }
                }
            } catch (Exception e) {
                // 未登录或异常情况返回默认租户 0
            }
            return new LongValue(0L);
        }

        @Override
        public String getTenantIdColumn() {
            return "tenant_id";
        }

        @Override
        public boolean ignoreTable(String tableName) {
            try {
                if (StpUtil.hasRole("super")) {
                    return true;
                }
            } catch (Exception e) {
                // ignore
            }
            return IGNORE_TABLES.contains(tableName);
        }
    }
}
