import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { ServiceException } from '../../common/result.js';

/**
 * 公开头像端点（对标 Java 端 AvatarController）
 *
 * - GET /avatar/{name}.svg：首字母 SVG 生成（公开，img 标签无法携带 Authorization 头）
 * - GET /avatar/file/{filename}：提供上传的头像文件（公开，仅输出图片内容）
 *
 * 文件名做白名单校验防目录穿越。
 */
@ApiTags('头像')
@Controller('avatar')
export class AvatarController {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  private static readonly PALETTE = [
    '#4f6ef7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  ];

  private static readonly MEDIA_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };

  /** GET /avatar/file/:filename：提供上传的头像文件（需在参数路由前声明，避免被 :name.svg 匹配） */
  @Get('file/:filename')
  @ApiOperation({ summary: '获取已上传的头像文件（公开）' })
  async avatarFile(@Param('filename') filename: string, @Res() reply: FastifyReply) {
    // 安全校验：仅允许安全文件名，防目录穿越
    if (!filename || !/^[A-Za-z0-9._-]{1,128}$/.test(filename)) {
      throw ServiceException.badRequest('无效的文件名');
    }

    const base = join(process.cwd(), this.uploadDir, 'avatar');
    const target = join(base, filename);

    // 防止目录穿越
    if (!target.startsWith(base)) {
      throw ServiceException.badRequest('无效的文件路径');
    }

    if (!existsSync(target) || !statSync(target).isFile()) {
      reply.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const mediaType = AvatarController.MEDIA_TYPES[ext] || 'application/octet-stream';

    const { readFile } = await import('fs/promises');
    const buffer = await readFile(target);

    reply
      .header('Content-Type', mediaType)
      .header('Cache-Control', 'public, max-age=604800')
      .send(buffer);
  }

  /** GET /avatar/:name.svg：首字母 SVG 生成 */
  @Get(':name.svg')
  @ApiOperation({ summary: '生成首字母 SVG 头像（公开）' })
  async avatar(@Param('name') name: string, @Res() reply: FastifyReply) {
    let clean = (name || '').replace(/[^\w\u4e00-\u9fa5-]/g, '');
    if (!clean) clean = 'U';

    const initials = this.initials(clean);
    const color = AvatarController.PALETTE[
      Math.abs(this.hashCode(clean)) % AvatarController.PALETTE.length
    ];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="48" fill="${color}"/>
  <text x="48" y="62" font-family="system-ui, sans-serif" font-size="38" font-weight="600"
        fill="#fff" text-anchor="middle">${initials}</text>
</svg>`;

    reply
      .header('Content-Type', 'image/svg+xml')
      .header('Cache-Control', 'public, max-age=604800')
      .send(svg);
  }

  /** 中文名取末 2 字，ASCII 取首 2 字母大写，单字取 1 字 */
  private initials(name: string): string {
    const ascii = name.replace(/[^\x00-\x7F]/g, '');
    if (ascii.length >= 2) {
      return ascii.substring(0, 2).toUpperCase();
    }
    if (ascii.length > 0) {
      return ascii.toUpperCase();
    }
    return name.length > 2 ? name.substring(name.length - 2) : name;
  }

  /** 简易字符串哈希（对标 Java String.hashCode()） */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = (hash << 5) - hash + ch;
      hash |= 0; // 转为 32 位整数
    }
    return hash;
  }
}
