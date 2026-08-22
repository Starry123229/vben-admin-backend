package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.dto.AssignMenuRequest;
import com.vben.backend.module.system.dto.RoleSaveRequest;
import com.vben.backend.module.system.service.SysRoleService;
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

import java.util.List;

/**
 * 角色管理接口（/system/role/**，仅 super/admin 可访问）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/role")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SystemRoleController {

    private final SysRoleService roleService;

    /** GET /system/role/list：分页角色列表 */
    @GetMapping("/list")
    public R<?> list(@RequestParam(defaultValue = "1") int page,
                     @RequestParam(defaultValue = "10") int pageSize,
                     @RequestParam(required = false) String name) {
        return R.ok(roleService.listRoles(page, pageSize, name));
    }

    /** POST /system/role：新建角色 */
    @PostMapping
    public R<Long> create(@RequestBody RoleSaveRequest req) {
        return R.ok(roleService.createRole(req));
    }

    /** PUT /system/role/{id}：更新角色（id 走路径，body 无 id 时以路径为准） */
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody RoleSaveRequest req) {
        if (req.getId() == null) {
            req.setId(id);
        }
        roleService.updateRole(req);
        return R.ok();
    }

    /** DELETE /system/role/{id}：删除角色 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        roleService.deleteRole(id);
        return R.ok();
    }

    /** GET /system/role/{id}/menus：角色已分配菜单 ID */
    @GetMapping("/{id}/menus")
    public R<List<Long>> menus(@PathVariable Long id) {
        return R.ok(roleService.getMenuIds(id));
    }

    /** POST /system/role/{id}/menus：分配角色菜单（全量替换） */
    @PostMapping("/{id}/menus")
    public R<Void> assignMenus(@PathVariable Long id, @RequestBody AssignMenuRequest req) {
        roleService.assignMenus(id, req);
        return R.ok();
    }
}
