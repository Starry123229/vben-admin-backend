package com.vben.backend.module.system.controller;

import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import cn.dev33.satoken.dao.SaTokenDao;
import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    /** 在线用户列表 */
    @GetMapping("/list")
    public R<List<Map<String, Object>>> list(@RequestParam(required = false) String username) {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            // Sa-Token 内存模式下 searchSessionId 不支持空字符串模糊搜索
            // 使用当前登录用户的 loginId 作为起点，同时尝试搜索已知用户 ID
            // 方案：遍历 sys_user 表中所有活跃用户，检查其 Sa-Token Session 是否存在
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
                    // 获取该用户的 Token
                    List<String> tokens = StpUtil.searchTokenValue(user.getId().toString(), 0, 10, false);
                    String tokenValue = tokens.isEmpty() ? "" : tokens.get(0);
                    Map<String, Object> item = new HashMap<>();
                    item.put("token", tokenValue);
                    item.put("userId", user.getId());
                    item.put("username", name);
                    item.put("loginTime", session.getCreateTime());
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

    /** 强制下线 */
    @DeleteMapping("/{token}")
    public R<Void> forceLogout(@PathVariable String token) {
        StpUtil.logoutByTokenValue(token);
        return R.ok();
    }
}
