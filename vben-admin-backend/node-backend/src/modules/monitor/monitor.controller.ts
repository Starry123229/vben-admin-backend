import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitorService } from './monitor.service.js';
import { R } from '../../common/result.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('系统-监控管理')
@ApiBearerAuth('JWT')
@Controller('system/monitor')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('server')
  @ApiOperation({ summary: '服务器监控信息' })
  async serverInfo() {
    return R.ok(await this.monitorService.serverInfo());
  }
}
