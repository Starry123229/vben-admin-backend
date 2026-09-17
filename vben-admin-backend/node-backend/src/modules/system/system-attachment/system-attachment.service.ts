import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult, ServiceException } from '../../../common/result.js';
import { FastifyFile } from '../../../common/interceptors/fastify-file.interceptor.js';
import dayjs from 'dayjs';
import { createHash } from 'crypto';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

@Injectable()
export class SystemAttachmentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number, bizType?: string, originalName?: string) {
    const where: any = {};
    if (bizType) where.bizType = bizType;
    if (originalName) where.originalName = { contains: originalName };
    const [items, total] = await Promise.all([
      this.prisma.sysAttachment.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysAttachment.count({ where }),
    ]);
    return new PageResult(
      items.map((a) => ({
        id: a.id.toString(),
        originalName: a.originalName,
        storagePath: a.storagePath,
        fileSize: a.fileSize.toString(),
        contentType: a.contentType,
        fileExt: a.fileExt,
        md5Hash: a.md5Hash,
        uploadUserId: a.uploadUserId.toString(),
        uploadUsername: a.uploadUsername,
        bizType: a.bizType,
        bizId: a.bizId,
        url: a.url,
        createTime: dayjs(a.createTime).format('YYYY/MM/DD HH:mm:ss'),
      })),
      total,
    );
  }

  async getById(id: string) {
    const a = await this.prisma.sysAttachment.findUnique({ where: { id: BigInt(id) } });
    if (!a) throw ServiceException.notFound('附件不存在');
    return {
      id: a.id.toString(),
      originalName: a.originalName,
      storagePath: a.storagePath,
      fileSize: a.fileSize.toString(),
      contentType: a.contentType,
      fileExt: a.fileExt,
      md5Hash: a.md5Hash,
      uploadUserId: a.uploadUserId.toString(),
      uploadUsername: a.uploadUsername,
      bizType: a.bizType,
      bizId: a.bizId,
      url: a.url,
      createTime: dayjs(a.createTime).format('YYYY/MM/DD HH:mm:ss'),
    };
  }

  async upload(file: FastifyFile, uploadUserId: bigint, uploadUsername: string, bizType?: string, bizId?: string) {
    if (!file) throw ServiceException.badRequest('缺少上传文件');
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const attachmentDir = join(uploadDir, 'attachments');
    if (!existsSync(attachmentDir)) mkdirSync(attachmentDir, { recursive: true });

    const md5Hash = createHash('md5').update(file.buffer).digest('hex');
    const fileExt = file.originalname.split('.').pop() || '';
    const storagePath = `attachments/${md5Hash}.${fileExt}`;
    const fullPath = join(uploadDir, storagePath);

    // 简单写入文件（生产环境应使用对象存储）
    const { writeFileSync } = require('fs');
    writeFileSync(fullPath, file.buffer);

    const attachment = await this.prisma.sysAttachment.create({
      data: {
        originalName: file.originalname,
        storagePath,
        fileSize: BigInt(file.size),
        contentType: file.mimetype,
        fileExt,
        md5Hash,
        uploadUserId,
        uploadUsername,
        bizType: bizType || null,
        bizId: bizId || null,
        url: `/uploads/${storagePath}`,
        createTime: dayjs().toDate(),
      },
    });

    return {
      id: attachment.id.toString(),
      originalName: attachment.originalName,
      storagePath: attachment.storagePath,
      fileSize: attachment.fileSize.toString(),
      contentType: attachment.contentType,
      fileExt: attachment.fileExt,
      md5Hash: attachment.md5Hash,
      uploadUserId: attachment.uploadUserId.toString(),
      uploadUsername: attachment.uploadUsername,
      bizType: attachment.bizType,
      bizId: attachment.bizId,
      url: attachment.url,
      createTime: dayjs(attachment.createTime).format('YYYY/MM/DD HH:mm:ss'),
    };
  }

  async delete(id: string): Promise<void> {
    const a = await this.prisma.sysAttachment.findUnique({ where: { id: BigInt(id) } });
    if (!a) throw ServiceException.badRequest('附件不存在');
    // 尝试删除物理文件
    try {
      const { unlinkSync } = require('fs');
      const fullPath = join(process.env.UPLOAD_DIR || './uploads', a.storagePath);
      if (existsSync(fullPath)) unlinkSync(fullPath);
    } catch { /* 忽略文件删除失败 */ }
    await this.prisma.sysAttachment.delete({ where: { id: BigInt(id) } });
  }
}
