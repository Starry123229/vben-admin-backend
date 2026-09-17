import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemRoleService } from './system-role.service.js';
import { RoleSaveDto, AssignMenuDto } from './dto/system-role.dto.js';
import { R } from '../../../common/result.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';

@ApiTags('系统-角色管理')
@ApiBearerAuth()
@Controller('system/role')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemRoleController {
  constructor(private readonly roleService: SystemRoleService) {}

  /** GET /system/role/list：分页角色列表 */
  @Get('list')
  @ApiOperation({ summary: '分页查询角色列表' })
  @Permissions('AC_1000001')
  async list(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('name') name?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.roleService.listRoles(
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      name,
      status !== undefined ? parseInt(status) : undefined,
    );
    return R.ok(result);
  }

  /** POST /system/role：新建角色 */
  @Post()
  @ApiOperation({ summary: '新建角色' })
  @Permissions('AC_1000002')
  async create(@Body() dto: RoleSaveDto) {
    const id = await this.roleService.createRole(dto);
    return R.ok(id);
  }

  /** PUT /system/role/:id：更新角色 */
  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @Permissions('AC_1000002')
  async update(@Param('id') id: string, @Body() dto: RoleSaveDto) {
    await this.roleService.updateRole(id, dto);
    return R.ok();
  }

  /** DELETE /system/role/:id：删除角色 */
  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @Permissions('AC_1000002')
  async delete(@Param('id') id: string) {
    await this.roleService.deleteRole(id);
    return R.ok();
  }

  /** GET /system/role/:id/menus：角色已分配菜单 ID */
  @Get(':id/menus')
  @ApiOperation({ summary: '查询角色已分配的菜单 ID 列表' })
  @Permissions('AC_1000002')
  async menus(@Param('id') id: string) {
    const menuIds = await this.roleService.getMenuIds(id);
    return R.ok(menuIds);
  }

  /** POST /system/role/:id/menus：分配角色菜单 */
  @Post(':id/menus')
  @ApiOperation({ summary: '分配角色菜单（全量替换）' })
  @Permissions('AC_1000002')
  async assignMenus(@Param('id') id: string, @Body() dto: AssignMenuDto) {
    await this.roleService.assignMenus(id, dto);
    return R.ok();
  }

  /** GET /system/role/export：导出角色列表 */
  @Get('export')
  @ApiOperation({ summary: '导出角色列表' })
  @Permissions('AC_1000001')
  async export(
    @Query('name') name?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.roleService.exportRoles(
      name,
      status !== undefined ? parseInt(status) : undefined,
    );
    return R.ok(data);
  }
}
