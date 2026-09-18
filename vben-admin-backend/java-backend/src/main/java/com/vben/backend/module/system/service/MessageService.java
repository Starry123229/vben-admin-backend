package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysMessage;
import com.vben.backend.module.system.mapper.SysMessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 消息中心服务：站内信 + 邮件通知。
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final SysMessageMapper messageMapper;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@example.com}")
    private String mailFrom;

    @Value("${app.message.mail-enabled:false}")
    private boolean mailEnabled;

    /**
     * 发送站内信（可同时发邮件）。
     * 由调用方在主线程提前获取 senderId，避免 @Async 线程中 Sa-Token 上下文丢失。
     *
     * @param userId    接收人 ID（0=全员广播）
     * @param senderId  发送人 ID（0=系统消息）
     * @param title     标题
     * @param content   内容
     * @param type      类型
     * @param email     可选邮箱（不为空且 mailEnabled 时发邮件）
     */
    @Async
    public void send(Long userId, long senderId, String title, String content, String type, String email) {
        // 保存站内信
        SysMessage msg = new SysMessage();
        msg.setUserId(userId);
        msg.setSenderId(senderId);
        msg.setTitle(title);
        msg.setContent(content);
        msg.setType(type != null ? type : "notice");
        msg.setIsRead(0);
        msg.setCreateTime(LocalDateTime.now());
        messageMapper.insert(msg);

        // 发送邮件
        if (mailEnabled && mailSender != null && email != null && !email.isBlank()) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom(mailFrom);
                mail.setTo(email);
                mail.setSubject(title);
                mail.setText(content);
                mailSender.send(mail);
                log.info("邮件已发送至 {}", email);
            } catch (Exception e) {
                log.error("邮件发送失败: {}", e.getMessage());
            }
        }
    }

    /**
     * 分页查询当前用户的站内信。
     */
    public PageResult<SysMessage> listMyMessages(int page, int pageSize, Integer isRead) {
        long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<SysMessage> w = new LambdaQueryWrapper<SysMessage>()
                .and(q -> q.eq(SysMessage::getUserId, userId).or().eq(SysMessage::getUserId, 0))
                .orderByDesc(SysMessage::getCreateTime);
        if (isRead != null) {
            w.eq(SysMessage::getIsRead, isRead);
        }
        IPage<SysMessage> p = messageMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    /**
     * 标记消息已读。
     */
    public void markRead(Long id) {
        SysMessage msg = messageMapper.selectById(id);
        if (msg == null) throw ServiceException.badRequest("消息不存在");
        long userId = StpUtil.getLoginIdAsLong();
        if (msg.getUserId() != userId && msg.getUserId() != 0) {
            throw ServiceException.badRequest("无权操作此消息");
        }
        msg.setIsRead(1);
        messageMapper.updateById(msg);
    }

    /**
     * 全部标记已读（批量更新，避免逐条 update 的性能问题）。
     */
    public void markAllRead() {
        long userId = StpUtil.getLoginIdAsLong();
        messageMapper.update(null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<SysMessage>()
                        .and(q -> q.eq(SysMessage::getUserId, userId).or().eq(SysMessage::getUserId, 0))
                        .eq(SysMessage::getIsRead, 0)
                        .set(SysMessage::getIsRead, 1));
    }

    /**
     * 获取未读消息数量。
     */
    public Map<String, Object> unreadCount() {
        long userId = StpUtil.getLoginIdAsLong();
        Long count = messageMapper.selectCount(
                new LambdaQueryWrapper<SysMessage>()
                        .and(q -> q.eq(SysMessage::getUserId, userId).or().eq(SysMessage::getUserId, 0))
                        .eq(SysMessage::getIsRead, 0));
        Map<String, Object> result = new HashMap<>();
        result.put("unread", count);
        return result;
    }
}
