package com.vben.backend.module.system.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储抽象接口。
 * <p>支持两种实现：
 * <ul>
 *   <li>{@link LocalFileStorageProvider}：本地磁盘存储（默认）</li>
 *   <li>{@link MinioFileStorageProvider}：MinIO/S3 对象存储</li>
 * </ul>
 * 通过 {@code vben.storage.type=local|minio} 配置切换。
 *
 * @author Starry
 */
public interface FileStorageProvider {

    /**
     * 上传文件到存储后端。
     *
     * @param file     Spring MultipartFile
     * @param category 文件分类目录（如 "avatar"、"upload"）
     * @return 上传后可访问的 URL 路径
     */
    String upload(MultipartFile file, String category);

    /**
     * 存储文件到指定分类目录，返回存储路径/对象 key（不含 URL 前缀）。
     *
     * @param file     Spring MultipartFile
     * @param category 文件分类目录
     * @return 存储路径/对象 key
     * @throws java.io.IOException 如果存储失败
     */
    default String store(org.springframework.web.multipart.MultipartFile file, String category) throws java.io.IOException {
        return upload(file, category);
    }

    /**
     * 根据存储路径获取可访问 URL。
     *
     * @param storagePath 存储路径/对象 key
     * @return 可访问的 URL
     */
    default String getUrl(String storagePath) {
        return storagePath;
    }

    /**
     * 删除存储中的文件。
     *
     * @param storagePath 存储路径/对象 key
     * @throws java.io.IOException 如果删除失败
     */
    default void delete(String storagePath) throws java.io.IOException {
        // 默认空实现，子类按需覆盖
    }

    /**
     * 返回当前存储类型标识。
     *
     * @return "local" 或 "minio"
     */
    String getType();
}
