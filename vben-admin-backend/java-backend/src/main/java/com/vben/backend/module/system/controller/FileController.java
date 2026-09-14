package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.storage.FileStorageProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 通用文件上传接口（/file/upload）。
 * 支持图片、文档等，限制 5MB。
 * 通过 {@link FileStorageProvider} 抽象，支持 local / minio 两种存储后端。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageProvider fileStorageProvider;

    @PostMapping("/upload")
    public R<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw ServiceException.badRequest("文件不能为空");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw ServiceException.badRequest("文件大小不能超过5MB");
        }

        String url = fileStorageProvider.upload(file, "upload");

        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        result.put("name", file.getOriginalFilename());
        result.put("size", String.valueOf(file.getSize()));
        return R.ok(result);
    }
}
