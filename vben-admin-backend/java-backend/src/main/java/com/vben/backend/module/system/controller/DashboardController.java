package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.R;
import com.vben.backend.module.system.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 仪表盘接口：提供分析页和工作台统计数据。
 * 所有已登录用户均可访问。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** GET /dashboard/overview：概览统计 */
    @GetMapping("/overview")
    public R<java.util.Map<String, Object>> overview() {
        return R.ok(dashboardService.overview());
    }

    /** GET /dashboard/user-trends：用户增长趋势 */
    @GetMapping("/user-trends")
    public R<java.util.List<java.util.Map<String, Object>>> userTrends() {
        return R.ok(dashboardService.userTrends());
    }

    /** GET /dashboard/role-distribution：角色分布 */
    @GetMapping("/role-distribution")
    public R<java.util.List<java.util.Map<String, Object>>> roleDistribution() {
        return R.ok(dashboardService.roleDistribution());
    }

    /** GET /dashboard/dept-distribution：部门用户分布 */
    @GetMapping("/dept-distribution")
    public R<java.util.List<java.util.Map<String, Object>>> deptDistribution() {
        return R.ok(dashboardService.deptDistribution());
    }

    /** GET /dashboard/workspace：工作台数据 */
    @GetMapping("/workspace")
    public R<java.util.Map<String, Object>> workspace() {
        return R.ok(dashboardService.workspace());
    }
}
