package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 通用文件上传接口（/file/upload）。
 * 支持图片、文档等，限制5MB。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

    @Value("${vben.auth.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public R<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw ServiceException.badRequest("文件不能为空");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw ServiceException.badRequest("文件大小不能超过5MB");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;

        File dir = new File(uploadDir, "avatar").getAbsoluteFile();
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try {
            File dest = new File(dir, fileName);
            file.transferTo(dest);
        } catch (IOException e) {
            throw ServiceException.badRequest("文件上传失败: " + e.getMessage());
        }

        Map<String, String> result = new HashMap<>();
        result.put("url", "/avatar/file/" + fileName);
        result.put("name", originalName);
        result.put("size", String.valueOf(file.getSize()));
        return R.ok(result);
    }
}
