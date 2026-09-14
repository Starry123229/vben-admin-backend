package com.vben.backend.module.system.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 数据权限注解：标记在 Service 方法上，由 {@code DataScopeAspect} 切面自动注入部门过滤条件。
 *
 * <p>策略：
 * <ul>
 *   <li>super 角色：无限制</li>
 *   <li>admin 角色：仅看本部门及子部门数据</li>
 *   <li>普通用户：仅看本部门数据</li>
 * </ul>
 *
 * @author Starry
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DataScope {

    /** 部门 ID 字段名（对应 SQL 中的列名），默认 dept_id */
    String deptField() default "dept_id";

    /** 表别名（如 QueryWrapper 中已指定 alias），默认空 */
    String tableAlias() default "";

    /** 是否只看本部门（true=仅本部门，false=本部门及子部门），默认 false */
    boolean onlySelf() default false;
}
