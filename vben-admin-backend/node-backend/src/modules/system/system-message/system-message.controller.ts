import { Controller, Get, Post, Put, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemMessageService } from './system-message.service.js';
import { R } from '../../../common/result.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('系统-站内信')
@ApiBearerAuth('JWT')
@Controller('system/message')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemMessageController {
  constructor(private readonly messageService: SystemMessageService) {}

  @Get('list')
  @ApiOperation({ summary: '当前用户消息分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'isRead', required: false, description: '是否已读：0 未读 / 1 已读' })
  async list(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('isRead') isRead?: string,
  ) {
    return R.ok(await this.messageService.list(
      BigInt(userId),
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      isRead !== undefined ? parseInt(isRead) : undefined,
    ));
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async unreadCount(@CurrentUser('id') userId: string) {
    return R.ok(await this.messageService.unreadCount(BigInt(userId)));
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记单条消息为已读' })
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.messageService.markRead(id, BigInt(userId));
    return R.ok();
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  async markAllRead(@CurrentUser('id') userId: string) {
    await this.messageService.markAllRead(BigInt(userId));
    return R.ok();
  }

  @Post('send')
  @ApiOperation({ summary: '发送站内信（管理员）' })
  @Roles('super', 'admin')
  async send(
    @Query('userId') userId: string,
    @Query('title') title: string,
    @Query('content') content?: string,
    @Query('type') type?: string,
    @Query('email') email?: string,
  ) {
    await this.messageService.send({
      userId: parseInt(userId),
      title,
      content,
      type,
      email,
    });
    return R.ok();
  }
}
