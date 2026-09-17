import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemAuditLogService } from './system-audit-log.service';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-审计日志')
@ApiBearerAuth('JWT')
@Controller('system/audit-log')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemAuditLogController {
  constructor(private readonly auditLogService: SystemAuditLogService) {}

  @Get('list')
  @ApiOperation({ summary: '审计日志分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'module', required: false, description: '模块名' })
  @ApiQuery({ name: 'entityType', required: false, description: '实体类型' })
  @ApiQuery({ name: 'operation', required: false, description: '操作类型' })
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('module') module?: string,
    @Query('entityType') entityType?: string,
    @Query('operation') operation?: string,
  ) {
    return R.ok(await this.auditLogService.list(parseInt(page) || 1, parseInt(pageSize) || 10, module, entityType, operation));
  }
}
