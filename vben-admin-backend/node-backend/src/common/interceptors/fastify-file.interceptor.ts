import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { FastifyRequest } from 'fastify';

/**
 * Fastify 文件上传拦截器
 * 替代 Express 的 FileInterceptor（NestJS + Fastify 下 multer 不可用）
 *
 * 用法：
 *   @UseInterceptors(new FastifyFileInterceptor('file'))
 *   async upload(@FastifyFileDecorator() file: FastifyFile, ...) { ... }
 */

export interface FastifyFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(
    private readonly fieldName: string = 'file',
    private readonly options?: { limits?: { fileSize?: number } },
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // 检查是否为 multipart 请求
    const contentType = request.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new BadRequestException('请求必须是 multipart/form-data 格式');
    }

    const file = await this.getFile(request);
    if (!file) {
      throw new BadRequestException(`缺少上传文件: ${this.fieldName}`);
    }

    // 将文件挂载到 request 上
    (request as any).file = file;

    return next.handle();
  }

  private async getFile(request: FastifyRequest): Promise<FastifyFile | null> {
    const parts = (request as any).parts();
    const fileSizeLimit = this.options?.limits?.fileSize || 20 * 1024 * 1024;

    for await (const part of parts) {
      if (part.type !== 'file') continue;
      if (part.fieldname !== this.fieldName) continue;

      // 使用 toBuffer() 方法读取文件内容
      const buffer = await part.toBuffer();
      if (buffer.length > fileSizeLimit) {
        throw new BadRequestException(
          `文件大小超过限制: ${fileSizeLimit} bytes`,
        );
      }

      return {
        buffer,
        originalname: part.filename,
        mimetype: part.mimetype,
        size: buffer.length,
      };
    }

    return null;
  }
}
