package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.dto.DeptSaveRequest;
import com.vben.backend.module.system.service.SysDeptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 部门管理接口（/system/dept/**，仅 super/admin 可访问）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/dept")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SystemDeptController {

    private final SysDeptService deptService;

    /** GET /system/dept/list：部门列表（扁平） */
    @GetMapping("/list")
    public R<?> list(@RequestParam(required = false) String keyword) {
        return R.ok(deptService.list(keyword));
    }

    /** POST /system/dept：新建部门 */
    @PostMapping
    public R<Long> create(@RequestBody DeptSaveRequest req) {
        return R.ok(deptService.create(req));
    }

    /** PUT /system/dept/{id}：更新部门（id 走路径，body 无 id 时以路径为准） */
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody DeptSaveRequest req) {
        if (req.getId() == null) {
            req.setId(id);
        }
        deptService.update(req);
        return R.ok();
    }

    /** DELETE /system/dept/{id}：删除部门 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        deptService.remove(id);
        return R.ok();
    }
}
