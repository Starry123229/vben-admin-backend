import { Controller, Get, Post, Put, Delete, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemWorkflowService } from './system-workflow.service.js';
import { R } from '../../../common/result.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';

@ApiTags('系统-工作流')
@ApiBearerAuth('JWT')
@Controller('system/workflow')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemWorkflowController {
  constructor(private readonly workflowService: SystemWorkflowService) {}

  @Get('list')
  @ApiOperation({ summary: '工作流定义分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'name', required: false, description: '名称模糊查询' })
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('name') name?: string,
  ) {
    return R.ok(await this.workflowService.list(parseInt(page) || 1, parseInt(pageSize) || 10, name));
  }

  @Post()
  @ApiOperation({ summary: '新建工作流定义' })
  @Roles('super', 'admin')
  async create(@Query() data: any) {
    return R.ok(await this.workflowService.create(data));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑工作流定义' })
  @Roles('super', 'admin')
  async update(@Param('id') id: string, @Query() data: any) {
    await this.workflowService.update(id, data);
    return R.ok();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除工作流定义' })
  @Roles('super', 'admin')
  async delete(@Param('id') id: string) {
    await this.workflowService.delete(id);
    return R.ok();
  }

  @Post('start')
  @ApiOperation({ summary: '发起审批' })
  async start(
    @CurrentUser('id') userId: string,
    @CurrentUser('username') username: string,
    @Query('workflowId') workflowId: string,
    @Query('title') title: string,
    @Query('content') content?: string,
    @Query('bizType') bizType?: string,
    @Query('bizId') bizId?: string,
  ) {
    return R.ok(await this.workflowService.start(
      parseInt(workflowId),
      BigInt(userId),
      username,
      title,
      content,
      bizType,
      bizId,
    ));
  }

  @Put(':instanceId/approve')
  @ApiOperation({ summary: '审批操作' })
  async approve(
    @Param('instanceId') instanceId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('username') username: string,
    @Query('action') action: string,
    @Query('comment') comment?: string,
  ) {
    await this.workflowService.approve(instanceId, action, comment, BigInt(userId), username);
    return R.ok();
  }

  @Put(':instanceId/cancel')
  @ApiOperation({ summary: '撤回申请' })
  async cancel(@Param('instanceId') instanceId: string) {
    await this.workflowService.cancel(instanceId);
    return R.ok();
  }

  @Get('instances')
  @ApiOperation({ summary: '我的审批列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  async instances(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('status') status?: string,
  ) {
    return R.ok(await this.workflowService.instances(parseInt(page) || 1, parseInt(pageSize) || 10, status, BigInt(userId)));
  }

  @Get(':instanceId/tasks')
  @ApiOperation({ summary: '审批记录' })
  async tasks(@Param('instanceId') instanceId: string) {
    return R.ok(await this.workflowService.tasks(instanceId));
  }
}
