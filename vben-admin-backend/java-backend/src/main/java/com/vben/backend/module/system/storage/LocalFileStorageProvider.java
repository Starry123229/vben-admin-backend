package com.vben.backend.module.system.storage;

import com.vben.backend.common.result.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 本地磁盘文件存储实现。
 * 文件落盘到 {base-dir}/{category}/ 目录，返回 {url-prefix}/{filename} 形式的 URL。
 *
 * @author Starry
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "vben.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageProvider implements FileStorageProvider {

    private final FileStorageProperties properties;

    @Override
    public String upload(MultipartFile file, String category) {
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            Path dir = Paths.get(properties.getLocal().getBaseDir(), category)
                    .toAbsolutePath().normalize();
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(fileName).toFile());
        } catch (IOException e) {
            throw ServiceException.badRequest("文件保存失败: " + e.getMessage());
        }

        return properties.getLocal().getUrlPrefix() + "/" + fileName;
    }

    @Override
    public String getType() {
        return "local";
    }
}
