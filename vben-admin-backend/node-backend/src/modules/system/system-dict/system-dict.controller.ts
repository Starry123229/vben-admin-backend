import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemDictService } from './system-dict.service';
import { DictTypeSaveDto, DictDataSaveDto } from './dto/system-dict.dto';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('系统-字典管理')
@ApiBearerAuth('JWT')
@Controller('system/dict')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('super', 'admin')
export class SystemDictController {
  constructor(private readonly dictService: SystemDictService) {}

  @Get('type/list')
  @ApiOperation({ summary: '字典类型分页列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: '10' })
  @ApiQuery({ name: 'name', required: false, description: '名称模糊查询' })
  @ApiQuery({ name: 'code', required: false, description: '编码模糊查询' })
  @ApiQuery({ name: 'status', required: false, description: '状态：0 停用 / 1 启用' })
  async typeList(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('name') name?: string,
    @Query('code') code?: string,
    @Query('status') status?: string,
  ) {
    return R.ok(await this.dictService.typeList(
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      name,
      code,
      status !== undefined ? parseInt(status) : undefined,
    ));
  }

  @Get('type/code-exists')
  @ApiOperation({ summary: '检查字典编码是否已存在' })
  @ApiQuery({ name: 'code', description: '字典编码' })
  @ApiQuery({ name: 'id', required: false, description: '排除的 ID（编辑时用）' })
  async codeExists(@Query('code') code: string, @Query('id') id?: string) {
    return R.ok(await this.dictService.codeExists(code, id));
  }

  @Post('type')
  @ApiOperation({ summary: '新增字典类型' })
  async createType(@Body() dto: DictTypeSaveDto) {
    return R.ok(await this.dictService.createType(dto));
  }

  @Put('type/:id')
  @ApiOperation({ summary: '编辑字典类型' })
  async updateType(@Param('id') id: string, @Body() dto: DictTypeSaveDto) {
    await this.dictService.updateType(id, dto);
    return R.ok();
  }

  @Delete('type/:id')
  @ApiOperation({ summary: '删除字典类型' })
  async deleteType(@Param('id') id: string) {
    await this.dictService.deleteType(id);
    return R.ok();
  }

  @Get('data/list')
  @ApiOperation({ summary: '字典数据列表' })
  @ApiQuery({ name: 'typeId', description: '字典类型 ID' })
  async dataList(@Query('typeId') typeId: string) {
    return R.ok(await this.dictService.dataList(typeId));
  }

  @Get('data/code/:code')
  @ApiOperation({ summary: '按编码查字典数据（公开接口）' })
  async dataByCode(@Param('code') code: string) {
    return R.ok(await this.dictService.dataByCode(code));
  }

  @Post('data')
  @ApiOperation({ summary: '新增字典数据' })
  async createData(@Body() dto: DictDataSaveDto) {
    return R.ok(await this.dictService.createData(dto));
  }

  @Put('data/:id')
  @ApiOperation({ summary: '编辑字典数据' })
  async updateData(@Param('id') id: string, @Body() dto: DictDataSaveDto) {
    await this.dictService.updateData(id, dto);
    return R.ok();
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  async deleteData(@Param('id') id: string) {
    await this.dictService.deleteData(id);
    return R.ok();
  }
}
