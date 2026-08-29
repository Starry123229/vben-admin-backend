package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.dto.UserSaveRequest;
import com.vben.backend.module.system.service.SysUserService;
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
 * 用户管理接口（/system/user/**）。
 *
 * <p>鉴权模型：按钮级权限码（sys_menu type=button 的 auth_code，Sa-Token 权限列表），
 * 前端按钮显隐与后端接口校验共用同一套码。超级管理员/管理员在种子数据中持有全部码。</p>
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SystemUserController {

    private final SysUserService userService;

    /** GET /system/user/list：分页用户列表（脱敏），需「查看用户」码 */
    @SaCheckPermission("AC_1000000")
    @GetMapping("/list")
    public R<?> list(@RequestParam(defaultValue = "1") int page,
                     @RequestParam(defaultValue = "10") int pageSize,
                     @RequestParam(required = false) String username,
                     @RequestParam(required = false) Integer status,
                     @RequestParam(required = false) Long deptId) {
        return R.ok(userService.listUsers(page, pageSize, username, status, deptId));
    }

    /** POST /system/user：新建用户，需「新增用户」码 */
    @SaCheckPermission("AC_100010")
    @PostMapping
    public R<Long> create(@RequestBody UserSaveRequest req) {
        return R.ok(userService.createUser(req));
    }

    /** PUT /system/user/{id}：更新用户，需「编辑用户」码 */
    @SaCheckPermission("AC_100020")
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody UserSaveRequest req) {
        if (req.getId() == null) {
            req.setId(id);
        }
        userService.updateUser(req);
        return R.ok();
    }

    /** DELETE /system/user/{id}：删除用户，需「删除用户」码 */
    @SaCheckPermission("AC_100030")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return R.ok();
    }

    /** POST /system/user/{id}/reset-password：重置密码（编辑级别权限） */
    @SaCheckPermission("AC_100020")
    @PostMapping("/{id}/reset-password")
    public R<Void> resetPassword(@PathVariable Long id,
                                 @RequestParam String newPassword) {
        userService.resetPassword(id, newPassword);
        return R.ok();
    }
}
