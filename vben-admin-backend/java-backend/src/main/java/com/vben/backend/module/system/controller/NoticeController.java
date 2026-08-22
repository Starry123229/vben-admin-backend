package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.service.SysNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知消息接口。
 * 所有已登录用户可查看/操作自己的通知；仅 super/admin 可发送广播。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final SysNoticeService noticeService;

    /** GET /system/notice/list：获取当前用户通知列表 */
    @GetMapping("/list")
    public R<List<Map<String, Object>>> list() {
        return R.ok(noticeService.listByCurrentUser());
    }

    /** PUT /system/notice/{id}/read：标记单条通知为已读 */
    @PutMapping("/{id}/read")
    public R<Void> markRead(@PathVariable Long id) {
        noticeService.markRead(id);
        return R.ok();
    }

    /** PUT /system/notice/read-all：全部标记已读 */
    @PutMapping("/read-all")
    public R<Void> markAllRead() {
        noticeService.markAllRead();
        return R.ok();
    }

    /** DELETE /system/notice/{id}：删除单条通知 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return R.ok();
    }

    /** DELETE /system/notice/clear：清空所有通知 */
    @DeleteMapping("/clear")
    public R<Void> clear() {
        noticeService.clearAll();
        return R.ok();
    }

    /** POST /system/notice/send：管理员发送通知给指定用户 */
    @PostMapping("/send")
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<Void> sendToUser(@RequestBody SendNoticeRequest req) {
        noticeService.sendToUser(req.userId, req.title, req.message,
                req.avatar, req.link, req.type);
        return R.ok();
    }

    /** POST /system/notice/broadcast：管理员按角色广播通知 */
    @PostMapping("/broadcast")
    @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
    public R<Integer> broadcast(@RequestBody BroadcastNoticeRequest req) {
        return R.ok(noticeService.broadcastByRole(req.roleId, req.title, req.message,
                req.avatar, req.link, req.type));
    }

    /** 发送通知请求体 */
    public static class SendNoticeRequest {
        public Long userId;
        public String title;
        public String message;
        public String avatar;
        public String link;
        public String type;
    }

    /** 广播通知请求体 */
    public static class BroadcastNoticeRequest {
        public Long roleId;
        public String title;
        public String message;
        public String avatar;
        public String link;
        public String type;
    }
}
