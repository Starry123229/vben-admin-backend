package com.vben.backend.module.system.storage;

import com.vben.backend.common.result.ServiceException;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * MinIO/S3 对象存储实现。
 * 文件上传到 MinIO bucket，返回 {url-prefix}/{category}/{filename} 形式的 URL。
 *
 * <p>使用前需添加 MinIO SDK 依赖：
 * <pre>
 * &lt;dependency&gt;
 *   &lt;groupId&gt;io.minio&lt;/groupId&gt;
 *   &lt;artifactId&gt;minio&lt;/artifactId&gt;
 *   &lt;version&gt;8.5.17&lt;/version&gt;
 * &lt;/dependency&gt;
 * </pre>
 *
 * @author Starry
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "vben.storage.type", havingValue = "minio")
public class MinioFileStorageProvider implements FileStorageProvider {

    private final FileStorageProperties properties;
    private MinioClient minioClient;

    @PostConstruct
    public void init() {
        FileStorageProperties.MinioConfig cfg = properties.getMinio();
        minioClient = MinioClient.builder()
                .endpoint(cfg.getEndpoint())
                .credentials(cfg.getAccessKey(), cfg.getSecretKey())
                .build();

        // 启动时确保 bucket 存在
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(cfg.getBucket()).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(cfg.getBucket()).build());
                log.info("MinIO bucket '{}' created", cfg.getBucket());
            }
        } catch (Exception e) {
            log.error("MinIO 初始化失败，请检查连接配置: {}", e.getMessage());
            throw new IllegalStateException("MinIO 初始化失败", e);
        }
    }

    @Override
    public String upload(MultipartFile file, String category) {
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = category + "/" + UUID.randomUUID().toString().replace("-", "") + ext;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getMinio().getBucket())
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType() != null
                                    ? file.getContentType() : "application/octet-stream")
                            .build());
        } catch (Exception e) {
            log.error("MinIO 文件上传失败: {}", e.getMessage());
            throw ServiceException.badRequest("文件上传失败: " + e.getMessage());
        }

        return properties.getMinio().getUrlPrefix() + "/" + fileName;
    }

    @Override
    public String getType() {
        return "minio";
    }
}
