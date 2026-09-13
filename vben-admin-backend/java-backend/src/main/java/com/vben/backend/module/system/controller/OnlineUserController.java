package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 在线用户管理（/system/online/**）。
 * 基于 Sa-Token Session 实时查询。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/online")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class OnlineUserController {

    private final SysUserMapper userMapper;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** 在线用户列表 */
    @GetMapping("/list")
    public R<List<Map<String, Object>>> list(@RequestParam(required = false) String username) {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            // 遍历 sys_user 表中所有活跃用户，检查其 Sa-Token Session 是否存在
            List<SysUser> activeUsers = userMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getStatus, 1));
            for (SysUser user : activeUsers) {
                try {
                    // 检查该用户是否有活跃的 Sa-Token Session
                    SaSession session = StpUtil.getSessionByLoginId(user.getId(), false);
                    if (session == null) continue;
                    String name = user.getUsername();
                    if (username != null && !username.isEmpty() && !name.contains(username)) {
                        continue;
                    }
                    // 通过 loginId 直接获取该用户的 token 值
                    String tokenValue = StpUtil.getTokenValueByLoginId(user.getId());
                    // Session 创建时间作为登录时间；若值异常则回退到当前时间
                    long createTime = session.getCreateTime();
                    if (createTime <= 0 || createTime > System.currentTimeMillis()) {
                        createTime = System.currentTimeMillis();
                    }
                    String loginTime = LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(createTime), ZoneId.systemDefault())
                            .format(DT_FMT);
                    Map<String, Object> item = new HashMap<>();
                    item.put("token", tokenValue);
                    item.put("userId", user.getId());
                    item.put("username", name);
                    item.put("loginTime", loginTime);
                    result.add(item);
                } catch (Exception e) {
                    // 该用户没有活跃 session，跳过
                }
            }
        } catch (Exception e) {
            // 忽略
        }
        return R.ok(result);
    }

    /** 强制下线：支持通过 token 或 userId 下线 */
    @DeleteMapping("/{tokenOrId}")
    public R<Void> forceLogout(@PathVariable String tokenOrId) {
        // 先尝试按 token 注销
        StpUtil.logoutByTokenValue(tokenOrId);
        // 同时尝试按 loginId 注销（兼容前端传 userId 的场景）
        try {
            long userId = Long.parseLong(tokenOrId);
            StpUtil.logout(userId);
        } catch (NumberFormatException ignored) {
            // 不是数字，仅按 token 注销即可
        }
        return R.ok();
    }
}
