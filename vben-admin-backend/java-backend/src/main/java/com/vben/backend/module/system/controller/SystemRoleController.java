package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.dto.AssignMenuRequest;
import com.vben.backend.module.system.dto.RoleSaveRequest;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.service.SysRoleService;
import com.vben.backend.module.system.util.ExcelUtils;
import jakarta.servlet.http.HttpServletResponse;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 角色管理接口（/system/role/**）。
 *
 * <p>鉴权模型：按钮级权限码 —— 查看类接口需「查看角色」AC_1000001，
 * 变更类接口需「编辑角色」AC_1000002。超级管理员/管理员在种子数据中持有全部码。</p>
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/role")
@RequiredArgsConstructor
public class SystemRoleController {

    private final SysRoleService roleService;

    /** GET /system/role/list：分页角色列表，需「查看角色」码 */
    @SaCheckPermission("AC_1000001")
    @GetMapping("/list")
    public R<?> list(@RequestParam(defaultValue = "1") int page,
                     @RequestParam(defaultValue = "10") int pageSize,
                     @RequestParam(required = false) String name,
                     @RequestParam(required = false) Integer status) {
        return R.ok(roleService.listRoles(page, pageSize, name, status));
    }

    /** POST /system/role：新建角色，需「编辑角色」码 */
    @SaCheckPermission("AC_1000002")
    @Log(module = "角色管理", description = "新增角色")
    @PostMapping
    public R<Long> create(@RequestBody RoleSaveRequest req) {
        return R.ok(roleService.createRole(req));
    }

    /** PUT /system/role/{id}：更新角色，需「编辑角色」码 */
    @SaCheckPermission("AC_1000002")
    @Log(module = "角色管理", description = "编辑角色")
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody RoleSaveRequest req) {
        if (req.getId() == null) {
            req.setId(id);
        }
        roleService.updateRole(req);
        return R.ok();
    }

    /** DELETE /system/role/{id}：删除角色，需「编辑角色」码 */
    @SaCheckPermission("AC_1000002")
    @Log(module = "角色管理", description = "删除角色")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        roleService.deleteRole(id);
        return R.ok();
    }

    /** GET /system/role/export：导出角色列表 Excel */
    @SaCheckPermission("AC_1000001")
    @Log(module = "角色管理", description = "导出角色列表")
    @GetMapping("/export")
    public void export(HttpServletResponse response,
                       @RequestParam(required = false) String name,
                       @RequestParam(required = false) Integer status) throws java.io.IOException {
        List<SysRole> roles = roleService.listRoles(1, 10000, name, status).getItems();
        List<String> headers = List.of("ID", "角色名称", "角色编码", "状态", "备注", "创建时间");
        List<Map<String, Object>> data = new ArrayList<>();
        for (SysRole r : roles) {
            Map<String, Object> row = new HashMap<>();
            row.put("ID", r.getId());
            row.put("角色名称", r.getName());
            row.put("角色编码", r.getCode());
            row.put("状态", r.getStatus() != null && r.getStatus() == 1 ? "启用" : "禁用");
            row.put("备注", r.getRemark() == null ? "" : r.getRemark());
            row.put("创建时间", r.getCreateTime() == null ? "" : r.getCreateTime().toString());
            data.add(row);
        }
        ExcelUtils.export(response, "角色列表", headers, data);
    }

    /** GET /system/role/{id}/menus：角色已分配菜单 ID（编辑抽屉数据，编辑级权限） */
    @SaCheckPermission("AC_1000002")
    @GetMapping("/{id}/menus")
    public R<List<Long>> menus(@PathVariable Long id) {
        return R.ok(roleService.getMenuIds(id));
    }

    /** POST /system/role/{id}/menus：分配角色菜单（全量替换），需「编辑角色」码 */
    @SaCheckPermission("AC_1000002")
    @Log(module = "角色管理", description = "分配菜单")
    @PostMapping("/{id}/menus")
    public R<Void> assignMenus(@PathVariable Long id, @RequestBody AssignMenuRequest req) {
        roleService.assignMenus(id, req);
        return R.ok();
    }
}
