import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemJobService } from './system-job.service';
import { SystemJobSaveDto } from './dto/system-job.dto';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-定时任务')
@ApiBearerAuth('JWT')
@Controller('system/job')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemJobController {
  constructor(private readonly jobService: SystemJobService) {}

  @Get('list')
  @ApiOperation({ summary: '定时任务列表' })
  async list() {
    return R.ok(await this.jobService.list());
  }

  @Post()
  @ApiOperation({ summary: '新增任务' })
  async create(@Body() dto: SystemJobSaveDto) {
    return R.ok(await this.jobService.create(dto));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑任务' })
  async update(@Param('id') id: string, @Body() dto: SystemJobSaveDto) {
    await this.jobService.update(id, dto);
    return R.ok();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  async delete(@Param('id') id: string) {
    await this.jobService.delete(id);
    return R.ok();
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: '切换任务状态（启用/停用）' })
  async toggle(@Param('id') id: string) {
    await this.jobService.toggle(id);
    return R.ok();
  }

  @Put(':id/run')
  @ApiOperation({ summary: '立即执行一次' })
  async run(@Param('id') id: string) {
    // Node 端暂不支持实际调度，仅返回成功
    return R.ok();
  }
}
