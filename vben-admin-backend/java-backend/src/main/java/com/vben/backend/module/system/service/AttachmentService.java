package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.entity.SysAttachment;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.mapper.SysAttachmentMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.storage.FileStorageProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Locale;

/**
 * 附件中心服务：文件上传、下载、列表、删除。
 * 通过 {@link FileStorageProvider} 抽象层支持本地磁盘和 MinIO。
 *
 * @author Starry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final SysAttachmentMapper attachmentMapper;
    private final SysUserMapper userMapper;
    private final FileStorageProvider storageProvider;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * 上传文件到附件中心。
     *
     * @param file    上传的文件
     * @param bizType 业务类型（可选）
     * @param bizId   业务 ID（可选）
     * @return 附件信息
     */
    public SysAttachment upload(MultipartFile file, String bizType, String bizId) {
        if (file == null || file.isEmpty()) {
            throw ServiceException.badRequest("请选择要上传的文件");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw ServiceException.badRequest("文件大小不能超过 50MB");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }

        // 计算 MD5
        String md5;
        try {
            md5 = DigestUtils.md5DigestAsHex(file.getInputStream());
        } catch (IOException e) {
            throw ServiceException.badRequest("文件读取失败");
        }

        // 去重检查
        SysAttachment existing = attachmentMapper.selectOne(
                new LambdaQueryWrapper<SysAttachment>().eq(SysAttachment::getMd5Hash, md5));
        if (existing != null) {
            log.info("文件已存在（MD5 去重），返回已有记录: {}", existing.getOriginalName());
            return existing;
        }

        // 存储文件
        String storagePath;
        try {
            storagePath = storageProvider.store(file, "attachments");
        } catch (IOException e) {
            log.error("文件存储失败", e);
            throw ServiceException.badRequest("文件存储失败: " + e.getMessage());
        }

        // 获取上传人信息
        Long userId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : 0L;
        SysUser user = userId > 0 ? userMapper.selectById(userId) : null;

        // 保存附件记录
        SysAttachment attachment = new SysAttachment();
        attachment.setOriginalName(originalName);
        attachment.setStoragePath(storagePath);
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());
        attachment.setFileExt(ext);
        attachment.setMd5Hash(md5);
        attachment.setUploadUserId(userId);
        attachment.setUploadUsername(user != null ? user.getUsername() : "system");
        attachment.setBizType(bizType);
        attachment.setBizId(bizId);
        attachment.setUrl(storageProvider.getUrl(storagePath));
        attachment.setCreateTime(LocalDateTime.now());
        attachmentMapper.insert(attachment);

        log.info("附件上传成功: {} -> {}", originalName, storagePath);
        return attachment;
    }

    /**
     * 分页查询附件列表。
     */
    public PageResult<SysAttachment> list(int page, int pageSize, String bizType, String originalName) {
        LambdaQueryWrapper<SysAttachment> w = new LambdaQueryWrapper<SysAttachment>()
                .orderByDesc(SysAttachment::getCreateTime);
        if (StringUtils.hasText(bizType)) {
            w.eq(SysAttachment::getBizType, bizType);
        }
        if (StringUtils.hasText(originalName)) {
            w.like(SysAttachment::getOriginalName, originalName);
        }
        IPage<SysAttachment> p = attachmentMapper.selectPage(new Page<>(page, pageSize), w);
        return new PageResult<>(p.getRecords(), p.getTotal());
    }

    /**
     * 删除附件（同时删除存储文件）。
     */
    public void delete(Long id) {
        SysAttachment attachment = attachmentMapper.selectById(id);
        if (attachment == null) {
            throw ServiceException.badRequest("附件不存在");
        }
        try {
            storageProvider.delete(attachment.getStoragePath());
        } catch (Exception e) {
            log.warn("删除存储文件失败: {}", e.getMessage());
        }
        attachmentMapper.deleteById(id);
    }

    /**
     * 获取附件详情。
     */
    public SysAttachment getById(Long id) {
        SysAttachment attachment = attachmentMapper.selectById(id);
        if (attachment == null) {
            throw ServiceException.badRequest("附件不存在");
        }
        return attachment;
    }
}
