package com.vben.backend.module.system.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.vben.backend.module.system.annotation.DataScope;
import com.vben.backend.module.system.entity.SysDept;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysDeptMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 数据权限切面：拦截带 @DataScope 注解的方法，自动注入部门过滤条件。
 *
 * <p>用法：在 Service 方法上加 @DataScope，方法参数中须包含 LambdaQueryWrapper 类型参数，
 * 切面会自动在 Wrapper 中追加 dept_id IN (...) 条件。
 *
 * @author Starry
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class DataScopeAspect {

    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;

    @Around("@annotation(dataScope)")
    public Object around(ProceedingJoinPoint joinPoint, DataScope dataScope) throws Throwable {
        // 超级管理员不过滤
        if (StpUtil.hasRole("super")) {
            return joinPoint.proceed();
        }

        long userId = StpUtil.getLoginIdAsLong();
        SysUser user = userMapper.selectById(userId);
        if (user == null || user.getDeptId() == null) {
            return joinPoint.proceed();
        }

        // 获取需要过滤的部门 ID 列表
        List<Long> deptIds = new ArrayList<>();
        deptIds.add(user.getDeptId());

        if (!dataScope.onlySelf() && StpUtil.hasRole("admin")) {
            // admin 可看子部门
            deptIds.addAll(getChildDeptIds(user.getDeptId()));
        }

        // 查找方法参数中的 QueryWrapper 并注入条件
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof QueryWrapper<?> wrapper) {
                String column = dataScope.tableAlias().isEmpty()
                        ? dataScope.deptField()
                        : dataScope.tableAlias() + "." + dataScope.deptField();
                wrapper.in(column, deptIds);
                break;
            }
        }

        return joinPoint.proceed();
    }

    /**
     * 递归获取子部门 ID 列表
     */
    private List<Long> getChildDeptIds(Long parentId) {
        List<SysDept> children = deptMapper.selectList(
                new QueryWrapper<SysDept>().eq("pid", parentId));
        List<Long> result = children.stream()
                .map(SysDept::getId)
                .collect(Collectors.toList());
        for (SysDept child : children) {
            result.addAll(getChildDeptIds(child.getId()));
        }
        return result;
    }
}
