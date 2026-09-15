package com.vben.backend.module.system.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysMessage;
import com.vben.backend.module.system.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 消息中心接口（/system/message/**）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** 分页查询当前用户的消息列表 */
    @GetMapping("/list")
    public R<PageResult<SysMessage>> list(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int pageSize,
                                           @RequestParam(required = false) Integer isRead) {
        return R.ok(messageService.listMyMessages(page, pageSize, isRead));
    }

    /** 获取未读消息数量 */
    @GetMapping("/unread-count")
    public R<Map<String, Object>> unreadCount() {
        return R.ok(messageService.unreadCount());
    }

    /** 标记单条消息为已读 */
    @PutMapping("/{id}/read")
    public R<Void> markRead(@PathVariable Long id) {
        messageService.markRead(id);
        return R.ok();
    }

    /** 全部标记已读 */
    @PutMapping("/read-all")
    public R<Void> markAllRead() {
        messageService.markAllRead();
        return R.ok();
    }

    /** 管理员发送站内信（需登录）
     * <p>前端通过 query params 传递参数（与 OpenAPI 文档一致），
     * 同时兼容 body JSON 方式。</p> */
    @Log(module = "消息中心", description = "发送站内信")
    @PostMapping("/send")
    public R<Void> send(@RequestParam(required = false) Long userId,
                        @RequestParam(required = false) Long receiverId,
                        @RequestParam(required = false) String title,
                        @RequestParam(required = false) String content,
                        @RequestParam(defaultValue = "notice") String type,
                        @RequestParam(required = false) String email) {
        Long uid = userId != null ? userId : receiverId;
        if (uid == null) {
            throw ServiceException.badRequest("接收用户ID不能为空");
        }
        if (title == null || title.isBlank()) {
            throw ServiceException.badRequest("消息标题不能为空");
        }
        // 在主线程获取 senderId，避免 @Async 线程中 Sa-Token 上下文丢失
        long senderId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : 0L;
        messageService.send(uid, senderId, title, content, type, email);
        return R.ok();
    }
}
