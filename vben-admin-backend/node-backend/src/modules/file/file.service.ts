import { Injectable } from '@nestjs/common';
import { ServiceException } from '../../common/result.js';
import { FastifyFile } from '../../common/interceptors/fastify-file.interceptor.js';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, createReadStream } from 'fs';
import { createHash, randomUUID } from 'crypto';

/**
 * 文件存储服务（对标 Java 端 FileStorageProvider + LocalFileStorageProvider）
 *
 * 本地磁盘存储实现：文件落盘到 {upload-dir}/{category}/ 目录，返回可访问 URL。
 */
@Injectable()
export class FileService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly urlPrefix = '/uploads';

  /**
   * 上传文件到本地磁盘
   * @param file 上传的文件对象
   * @param category 文件分类目录（默认 "upload"）
   * @returns { url, name, size }
   */
  async upload(file: FastifyFile, category = 'upload'): Promise<{ url: string; name: string; size: string }> {
    if (!file || !file.buffer) {
      throw ServiceException.badRequest('文件不能为空');
    }

    // 生成唯一文件名
    const ext = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.'))
      : '';
    const fileName = randomUUID().replace(/-/g, '') + ext;

    // 确保目录存在
    const dir = join(process.cwd(), this.uploadDir, category);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    const fullPath = join(dir, fileName);
    try {
      writeFileSync(fullPath, file.buffer);
    } catch (e) {
      throw ServiceException.badRequest('文件保存失败: ' + (e as Error).message);
    }

    const url = `${this.urlPrefix}/${category}/${fileName}`;

    return {
      url,
      name: file.originalname,
      size: String(file.size),
    };
  }
}
