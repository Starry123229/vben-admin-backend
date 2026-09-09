package com.vben.backend.module.system.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 操作日志注解：标记在 Controller 方法上，由 {@code LogAspect} 切面自动记录操作日志。
 *
 * @author Starry
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Log {

    /** 操作模块（如"用户管理"） */
    String module() default "";

    /** 操作描述（如"新增用户"） */
    String description() default "";
}
