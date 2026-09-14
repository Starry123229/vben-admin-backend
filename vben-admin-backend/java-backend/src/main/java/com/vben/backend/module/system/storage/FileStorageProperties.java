package com.vben.backend.module.system.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 文件存储配置属性。
 *
 * <pre>
 * vben:
 *   storage:
 *     type: local          # local | minio
 *     local:
 *       base-dir: ./uploads  # 本地存储根目录
 *       url-prefix: /api/avatar/file  # 本地文件访问 URL 前缀
 *     minio:
 *       endpoint: http://localhost:9000
 *       access-key: minioadmin
 *       secret-key: minioadmin
 *       bucket: vben-uploads
 *       url-prefix: http://localhost:9000/vben-uploads  # 公开访问 URL 前缀
 * </pre>
 *
 * @author Starry
 */
@Data
@Component
@ConfigurationProperties(prefix = "vben.storage")
public class FileStorageProperties {

    /** 存储类型：local 或 minio，默认 local */
    private String type = "local";

    /** 本地存储配置 */
    private LocalConfig local = new LocalConfig();

    /** MinIO/S3 配置 */
    private MinioConfig minio = new MinioConfig();

    @Data
    public static class LocalConfig {
        /** 本地存储根目录 */
        private String baseDir = "./uploads";
        /** 本地文件访问 URL 前缀 */
        private String urlPrefix = "/api/avatar/file";
    }

    @Data
    public static class MinioConfig {
        /** MinIO 服务地址 */
        private String endpoint = "http://localhost:9000";
        /** 访问密钥 */
        private String accessKey = "minioadmin";
        /** 秘密密钥 */
        private String secretKey = "minioadmin";
        /** 存储桶名称 */
        private String bucket = "vben-uploads";
        /** 公开访问 URL 前缀（endpoint + "/" + bucket） */
        private String urlPrefix = "http://localhost:9000/vben-uploads";
    }
}
