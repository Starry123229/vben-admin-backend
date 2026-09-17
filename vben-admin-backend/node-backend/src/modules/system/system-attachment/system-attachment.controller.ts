import { Controller, Get, Post, Delete, Query, Param, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SystemAttachmentService } from './system-attachment.service';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('系统-附件管理')
@ApiBearerAuth('JWT')
@Controller('system/attachment')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemAttachmentController {
  constructor(private readonly attachmentService: SystemAttachmentService) {}

  @Get('list')
  @ApiOperation({ summary: '附件分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'bizType', required: false, description: '业务类型' })
  @ApiQuery({ name: 'originalName', required: false, description: '文件名模糊查询' })
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('bizType') bizType?: string,
    @Query('originalName') originalName?: string,
  ) {
    return R.ok(await this.attachmentService.list(parseInt(page) || 1, parseInt(pageSize) || 10, bizType, originalName));
  }

  @Get(':id')
  @ApiOperation({ summary: '附件详情' })
  async getById(@Param('id') id: string) {
    return R.ok(await this.attachmentService.getById(id));
  }

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        bizType: { type: 'string' },
        bizId: { type: 'string' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('username') username: string,
    @Body('bizType') bizType?: string,
    @Body('bizId') bizId?: string,
  ) {
    return R.ok(await this.attachmentService.upload(file, BigInt(userId), username, bizType, bizId));
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除附件' })
  async delete(@Param('id') id: string) {
    await this.attachmentService.delete(id);
    return R.ok();
  }
}
