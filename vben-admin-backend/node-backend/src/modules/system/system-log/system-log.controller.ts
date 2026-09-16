import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemLogService } from './system-log.service';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-日志管理')
@ApiBearerAuth('JWT')
@Controller('system/log')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemLogController {
  constructor(private readonly logService: SystemLogService) {}

  @Get('operation/list')
  @ApiOperation({ summary: '操作日志分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'username', required: false, description: '操作用户名' })
  @ApiQuery({ name: 'module', required: false, description: '模块名' })
  @ApiQuery({ name: 'status', required: false, description: '操作状态' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  async operationList(
    @Query('page') page = '1', @Query('pageSize') pageSize = '10',
    @Query('username') username?: string, @Query('module') module?: string,
    @Query('status') status?: string, @Query('startTime') startTime?: string, @Query('endTime') endTime?: string,
  ) {
    return R.ok(await this.logService.operationList(parseInt(page) || 1, parseInt(pageSize) || 10, username, module, status !== undefined ? parseInt(status) : undefined, startTime, endTime));
  }

  @Get('login/list')
  @ApiOperation({ summary: '登录日志分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'username', required: false, description: '登录用户名' })
  @ApiQuery({ name: 'status', required: false, description: '登录状态' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  async loginList(
    @Query('page') page = '1', @Query('pageSize') pageSize = '10',
    @Query('username') username?: string, @Query('status') status?: string,
    @Query('startTime') startTime?: string, @Query('endTime') endTime?: string,
  ) {
    return R.ok(await this.logService.loginList(parseInt(page) || 1, parseInt(pageSize) || 10, username, status !== undefined ? parseInt(status) : undefined, startTime, endTime));
  }

  @Delete('operation')
  @ApiOperation({ summary: '清空操作日志' })
  async clearOperation() { await this.logService.clearOperationLogs(); return R.ok(); }

  @Delete('login')
  @ApiOperation({ summary: '清空登录日志' })
  async clearLogin() { await this.logService.clearLoginLogs(); return R.ok(); }
}
