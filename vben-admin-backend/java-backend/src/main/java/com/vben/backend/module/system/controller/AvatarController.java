package com.vben.backend.module.system.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Map;

/**
 * 公开头像端点：/avatar/{name}.svg（首字母 SVG 生成）与 /avatar/file/{filename}（上传文件）。
 *
 * <p>img 标签无法携带 Authorization 头，故这些端点不做鉴权；
 * 均只输出图片内容，不含任何敏感数据。文件名做白名单校验防目录穿越。</p>
 *
 * @author Starry
 */
@RestController
public class AvatarController {

    /** 上传文件根目录，与 SysUserService.saveAvatar 保持一致 */
    @Value("${vben.auth.upload-dir:./uploads}")
    private String uploadDir;

    private static final Map<String, MediaType> MEDIA_TYPES = Map.of(
            ".jpg", MediaType.IMAGE_JPEG,
            ".jpeg", MediaType.IMAGE_JPEG,
            ".png", MediaType.IMAGE_PNG,
            ".webp", MediaType.parseMediaType("image/webp"),
            ".gif", MediaType.IMAGE_GIF);

    private static final String[] PALETTE = {
        "#4f6ef7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
    };

    @GetMapping("/avatar/{name}.svg")
    public ResponseEntity<String> avatar(@PathVariable String name) {        String clean = name.replaceAll("[^\\w\\u4e00-\\u9fa5-]", "");
        if (clean.isEmpty()) {
            clean = "U";
        }
        String initials = initials(clean);
        String color = PALETTE[Math.abs(clean.hashCode()) % PALETTE.length];
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
                  <rect width="96" height="96" rx="48" fill="%s"/>
                  <text x="48" y="62" font-family="system-ui, sans-serif" font-size="38" font-weight="600"
                        fill="#fff" text-anchor="middle">%s</text>
                </svg>
                """
                .formatted(color, initials);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/svg+xml"))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)))
                .body(svg);
    }

    /** GET /avatar/file/{filename}：提供上传的头像文件（仅允许安全文件名，防目录穿越） */
    @GetMapping("/avatar/file/{filename}")
    public ResponseEntity<FileSystemResource> avatarFile(@PathVariable String filename) {
        if (filename == null || !filename.matches("[A-Za-z0-9._-]{1,128}")) {
            return ResponseEntity.badRequest().build();
        }
        Path base = Paths.get(uploadDir, "avatar").toAbsolutePath().normalize();
        Path target = base.resolve(filename).normalize();
        if (!target.startsWith(base) || !Files.isRegularFile(target)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        String ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        MediaType mediaType = MEDIA_TYPES.getOrDefault(ext, MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)))
                .body(new FileSystemResource(target));
    }

    /** 中文名取末 2 字，ASCII 取首 2 字母大写，单字取 1 字 */
    private String initials(String name) {
        String ascii = name.replaceAll("[^\\x00-\\x7F]", "");
        if (ascii.length() >= 2) {
            return ascii.substring(0, 2).toUpperCase();
        }
        if (!ascii.isEmpty()) {
            return ascii.toUpperCase();
        }
        return name.length() > 2 ? name.substring(name.length() - 2) : name;
    }
}
