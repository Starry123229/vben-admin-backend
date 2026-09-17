import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { FastifyFile } from '../interceptors/fastify-file.interceptor.js';

/**
 * @FastifyFile() 装饰器
 * 从 request.file 中提取 FastifyFile 对象（由 FastifyFileInterceptor 挂载）
 * 替代 NestJS Express 模式下的 @UploadedFile()
 */
export const FastifyFileDecorator = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const file = (request as any).file as FastifyFile | undefined;
    return file;
  },
);
