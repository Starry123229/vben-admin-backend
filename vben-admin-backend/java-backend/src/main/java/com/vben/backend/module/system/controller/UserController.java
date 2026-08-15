package com.vben.backend.module.system.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户接口（契约 §3.5）。
 *
 * @author Starry
 */
@RestController
@RequiredArgsConstructor
public class UserController {

    private final SysUserService userService;

    /** GET /user/info：返回脱敏用户信息（绝不含密码），字段对齐前端 UserInfo 类型 */
    @GetMapping("/user/info")
    public R<Map<String, Object>> info() {
        long userId = StpUtil.getLoginIdAsLong();
        SysUser user = userService.getById(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("avatar", user.getAvatar());
        data.put("roles", userService.getRoleCodes(userId));
        data.put("homePath", user.getHomePath());
        return R.ok(data);
    }
}
