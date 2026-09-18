import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileService } from './file.service.js';
import { R, ServiceException } from '../../common/result.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { FastifyFileInterceptor, FastifyFile } from '../../common/interceptors/fastify-file.interceptor.js';
import { FastifyFileDecorator } from '../../common/decorators/fastify-file.decorator.js';

/**
 * 通用文件上传接口（对标 Java 端 FileController）
 *
 * POST /file/upload：支持图片、文档等，限制 5MB。
 */
@ApiTags('文件')
@ApiBearerAuth('JWT')
@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '通用文件上传（限 5MB）' })
  @UseInterceptors(new FastifyFileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async upload(@FastifyFileDecorator() file: FastifyFile) {
    if (!file) throw ServiceException.badRequest('文件不能为空');
    if (file.size > 5 * 1024 * 1024) {
      throw ServiceException.badRequest('文件大小不能超过5MB');
    }
    return R.ok(await this.fileService.upload(file));
  }
}
