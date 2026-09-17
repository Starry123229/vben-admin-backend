import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemConfigService } from './system-config.service';
import { SystemConfigSaveDto } from './dto/system-config.dto';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-配置管理')
@ApiBearerAuth('JWT')
@Controller('system/config')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get('list')
  @ApiOperation({ summary: '配置分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'name', required: false, description: '参数名称模糊查询' })
  @ApiQuery({ name: 'key', required: false, description: '参数键模糊查询' })
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('name') name?: string,
    @Query('key') key?: string,
  ) {
    return R.ok(await this.configService.list(parseInt(page) || 1, parseInt(pageSize) || 10, name, key));
  }

  @Get('key-exists')
  @ApiOperation({ summary: '检查参数键是否已存在' })
  @ApiQuery({ name: 'key', description: '参数键' })
  @ApiQuery({ name: 'id', required: false, description: '排除的 ID（编辑时用）' })
  async keyExists(@Query('key') key: string, @Query('id') id?: string) {
    return R.ok(await this.configService.keyExists(key, id));
  }

  @Get('key/:key')
  @ApiOperation({ summary: '按 key 查参数值' })
  async getByKey(@Param('key') key: string) {
    return R.ok(await this.configService.getByKey(key));
  }

  @Post()
  @ApiOperation({ summary: '新增参数' })
  async create(@Body() dto: SystemConfigSaveDto) {
    return R.ok(await this.configService.create(dto));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑参数' })
  async update(@Param('id') id: string, @Body() dto: SystemConfigSaveDto) {
    await this.configService.update(id, dto);
    return R.ok();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除参数' })
  async delete(@Param('id') id: string) {
    await this.configService.delete(id);
    return R.ok();
  }
}
