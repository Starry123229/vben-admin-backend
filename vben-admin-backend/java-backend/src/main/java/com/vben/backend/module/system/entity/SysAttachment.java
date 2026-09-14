package com.vben.backend.module.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 附件信息实体。
 *
 * @author Starry
 */
@Data
@TableName("sys_attachment")
public class SysAttachment {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 原始文件名 */
    private String originalName;

    /** 存储路径/对象 key */
    private String storagePath;

    /** 文件大小（字节） */
    private Long fileSize;

    /** 文件 MIME 类型 */
    private String contentType;

    /** 文件后缀（如 .png, .pdf） */
    private String fileExt;

    /** 文件 MD5（用于去重） */
    private String md5Hash;

    /** 上传人用户 ID */
    private Long uploadUserId;

    /** 上传人用户名 */
    private String uploadUsername;

    /** 关联业务类型（如 avatar, notice, workflow） */
    private String bizType;

    /** 关联业务 ID */
    private String bizId;

    /** 访问 URL */
    private String url;

    /** 创建时间 */
    private LocalDateTime createTime;
}
