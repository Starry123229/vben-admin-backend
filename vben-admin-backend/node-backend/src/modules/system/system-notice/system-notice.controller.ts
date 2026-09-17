import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemNoticeService } from './system-notice.service.js';
import { SendNoticeDto, BroadcastNoticeDto } from './dto/system-notice.dto.js';
import { R } from '../../../common/result.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('系统-通知消息')
@ApiBearerAuth('JWT')
@Controller('system/notice')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemNoticeController {
  constructor(private readonly noticeService: SystemNoticeService) {}

  @Get('list')
  @ApiOperation({ summary: '当前用户通知列表' })
  async list(@CurrentUser('id') userId: string) {
    return R.ok(await this.noticeService.listByUser(BigInt(userId)));
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记单条通知为已读' })
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.noticeService.markRead(id, BigInt(userId));
    return R.ok();
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  async markAllRead(@CurrentUser('id') userId: string) {
    await this.noticeService.markAllRead(BigInt(userId));
    return R.ok();
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空所有通知' })
  async clear(@CurrentUser('id') userId: string) {
    await this.noticeService.clearAll(BigInt(userId));
    return R.ok();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除单条通知' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.noticeService.deleteNotice(id, BigInt(userId));
    return R.ok();
  }

  @Post('send')
  @ApiOperation({ summary: '发送通知给指定用户' })
  @Roles('super', 'admin')
  async sendToUser(@Body() dto: SendNoticeDto) {
    await this.noticeService.sendToUser(dto);
    return R.ok();
  }

  @Post('broadcast')
  @ApiOperation({ summary: '按角色广播通知' })
  @Roles('super', 'admin')
  async broadcast(@Body() dto: BroadcastNoticeDto) {
    return R.ok(await this.noticeService.broadcast(dto));
  }
}
