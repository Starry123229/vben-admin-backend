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
import { SystemMenuService } from './system-menu.service';
import { MenuSaveDto } from './dto/system-menu.dto';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-菜单管理')
@ApiBearerAuth('JWT')
@Controller('system/menu')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemMenuController {
  constructor(private readonly menuService: SystemMenuService) {}

  /** GET /system/menu/list：菜单扁平列表 */
  @Get('list')
  @ApiOperation({ summary: '菜单扁平列表' })
  async list() {
    return R.ok(await this.menuService.listAll());
  }

  /** GET /system/menu/tree：菜单树 */
  @Get('tree')
  @ApiOperation({ summary: '菜单树（权限分配用）' })
  async tree() {
    return R.ok(await this.menuService.tree());
  }

  /** POST /system/menu：新建菜单 */
  @Post()
  @ApiOperation({ summary: '新建菜单' })
  async create(@Body() dto: MenuSaveDto) {
    const id = await this.menuService.create(dto);
    return R.ok(id);
  }

  /** PUT /system/menu/:id：更新菜单 */
  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  async update(@Param('id') id: string, @Body() dto: MenuSaveDto) {
    await this.menuService.update(id, dto);
    return R.ok();
  }

  /** DELETE /system/menu/:id：删除菜单 */
  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  async delete(@Param('id') id: string) {
    await this.menuService.remove(id);
    return R.ok();
  }

  /** GET /system/menu/name-exists：菜单名是否重复 */
  @Get('name-exists')
  @ApiOperation({ summary: '检查菜单名是否已存在' })
  @ApiQuery({ name: 'name', description: '菜单名' })
  @ApiQuery({ name: 'id', required: false, description: '排除的 ID（编辑时用）' })
  async nameExists(
    @Query('name') name: string,
    @Query('id') id?: string,
  ) {
    return R.ok(await this.menuService.nameExists(name, id));
  }

  /** GET /system/menu/path-exists：菜单路径是否重复 */
  @Get('path-exists')
  @ApiOperation({ summary: '检查菜单路径是否已存在' })
  @ApiQuery({ name: 'path', description: '路由路径' })
  @ApiQuery({ name: 'id', required: false, description: '排除的 ID（编辑时用）' })
  async pathExists(
    @Query('path') path: string,
    @Query('id') id?: string,
  ) {
    return R.ok(await this.menuService.pathExists(path, id));
  }
}
