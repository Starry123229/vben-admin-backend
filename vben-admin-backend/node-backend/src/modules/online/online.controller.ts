import { Controller, Get, Delete, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OnlineUserService } from './online.service';
import { R, ServiceException } from '../../common/result';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('系统-在线用户')
@ApiBearerAuth('JWT')
@Controller('system/online')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class OnlineController {
  constructor(private readonly onlineService: OnlineUserService) {}

  @Get('list')
  @ApiOperation({ summary: '在线用户列表' })
  @ApiQuery({ name: 'username', required: false, description: '用户名模糊查询' })
  async list(@Query('username') username?: string) {
    return R.ok(await this.onlineService.list(username));
  }

  @Delete(':tokenOrId')
  @ApiOperation({ summary: '强制下线' })
  async forceLogout(@Param('tokenOrId') tokenOrId: string, @CurrentUser('id') currentUserId: string) {
    await this.onlineService.forceLogout(tokenOrId, currentUserId);
    return R.ok();
  }
}
