import {
  Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemDeptService } from './system-dept.service.js';
import { DeptSaveDto } from './dto/system-dept.dto.js';
import { R } from '../../../common/result.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@ApiTags('系统-部门管理')
@ApiBearerAuth('JWT')
@Controller('system/dept')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemDeptController {
  constructor(private readonly deptService: SystemDeptService) {}

  /** GET /system/dept/list */
  @Get('list')
  @ApiOperation({ summary: '部门列表' })
  @ApiQuery({ name: 'keyword', required: false, description: '部门名模糊查询' })
  @Permissions('AC_1000000')
  async list(@Query('keyword') keyword?: string) {
    return R.ok(await this.deptService.list(keyword));
  }

  /** POST /system/dept */
  @Post()
  @ApiOperation({ summary: '新建部门' })
  @Roles('super', 'admin')
  async create(@Body() dto: DeptSaveDto) {
    return R.ok(await this.deptService.create(dto));
  }

  /** PUT /system/dept/:id */
  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  @Roles('super', 'admin')
  async update(@Param('id') id: string, @Body() dto: DeptSaveDto) {
    await this.deptService.update(id, dto);
    return R.ok();
  }

  /** DELETE /system/dept/:id */
  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @Roles('super', 'admin')
  async delete(@Param('id') id: string) {
    await this.deptService.remove(id);
    return R.ok();
  }
}
