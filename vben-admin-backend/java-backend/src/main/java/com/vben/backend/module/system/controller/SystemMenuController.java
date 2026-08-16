package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.dto.MenuSaveRequest;
import com.vben.backend.module.system.service.SysMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 菜单管理接口（/system/menu/**，仅 super/admin 可访问）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/menu")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SystemMenuController {

    private final SysMenuService menuService;

    /** GET /system/menu/list：菜单扁平列表 */
    @GetMapping("/list")
    public R<List<?>> list() {
        return R.ok(menuService.listAll());
    }

    /** GET /system/menu/tree：菜单树（权限分配勾选用） */
    @GetMapping("/tree")
    public R<List<Map<String, Object>>> tree() {
        return R.ok(menuService.tree());
    }

    /** POST /system/menu：新建菜单 */
    @PostMapping
    public R<Long> create(@RequestBody MenuSaveRequest req) {
        return R.ok(menuService.create(req));
    }

    /** PUT /system/menu：更新菜单 */
    @PutMapping
    public R<Void> update(@RequestBody MenuSaveRequest req) {
        menuService.update(req);
        return R.ok();
    }

    /** DELETE /system/menu/{id}：删除菜单 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        menuService.remove(id);
        return R.ok();
    }

    /** GET /system/menu/name-exists：菜单名是否重复（排除 id） */
    @GetMapping("/name-exists")
    public R<Boolean> nameExists(@RequestParam String name,
                                 @RequestParam(required = false) Long id) {
        return R.ok(menuService.nameExists(name, id));
    }

    /** GET /system/menu/path-exists：菜单路径是否重复（排除 id） */
    @GetMapping("/path-exists")
    public R<Boolean> pathExists(@RequestParam String path,
                                 @RequestParam(required = false) Long id) {
        return R.ok(menuService.pathExists(path, id));
    }
}
