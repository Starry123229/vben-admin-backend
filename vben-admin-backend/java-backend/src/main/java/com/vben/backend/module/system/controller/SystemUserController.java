package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.dto.UserItemVO;
import com.vben.backend.module.system.dto.UserSaveRequest;
import com.vben.backend.module.system.service.SysUserService;
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
    @Log(module = "用户管理", description = "新增用户")
    @PostMapping
    public R<Long> create(@RequestBody UserSaveRequest req) {
        return R.ok(userService.createUser(req));
    }

    /** PUT /system/user/{id}：更新用户，需「编辑用户」码 */
    @SaCheckPermission("AC_100020")
    @Log(module = "用户管理", description = "编辑用户")
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
    @Log(module = "用户管理", description = "删除用户")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return R.ok();
    }

    /** GET /system/user/export：导出用户列表 Excel */
    @SaCheckPermission("AC_1000000")
    @Log(module = "用户管理", description = "导出用户列表")
    @GetMapping("/export")
    public void export(HttpServletResponse response,
                       @RequestParam(required = false) String username,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(required = false) Long deptId) throws java.io.IOException {
        List<UserItemVO> users = userService.listUsers(1, 10000, username, status, deptId).getItems();
        List<String> headers = List.of("ID", "用户名", "真实姓名", "部门ID", "状态", "备注", "创建时间");
        List<Map<String, Object>> data = new ArrayList<>();
        for (UserItemVO u : users) {
            Map<String, Object> row = new HashMap<>();
            row.put("ID", u.getId());
            row.put("用户名", u.getUsername());
            row.put("真实姓名", u.getRealName() == null ? "" : u.getRealName());
            row.put("部门ID", u.getDeptId() == null ? "" : u.getDeptId());
            row.put("状态", u.getStatus() != null && u.getStatus() == 1 ? "启用" : "禁用");
            row.put("备注", u.getRemark() == null ? "" : u.getRemark());
            row.put("创建时间", u.getCreateTime() == null ? "" : u.getCreateTime().toString());
            data.add(row);
        }
        ExcelUtils.export(response, "用户列表", headers, data);
    }

    /** POST /system/user/{id}/reset-password：重置密码（编辑级别权限） */
    @SaCheckPermission("AC_100020")
    @Log(module = "用户管理", description = "重置密码")
    @PostMapping("/{id}/reset-password")
    public R<Void> resetPassword(@PathVariable Long id,
                                 @RequestParam String newPassword) {
        userService.resetPassword(id, newPassword);
        return R.ok();
    }
}
