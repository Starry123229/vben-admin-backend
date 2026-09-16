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
import { SystemUserService } from './system-user.service';
import { SystemUserSaveDto, ResetPasswordDto } from './dto/system-user.dto';
import { R } from '../../../common/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('系统-用户管理')
@ApiBearerAuth()
@Controller('system/user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemUserController {
  constructor(private readonly userService: SystemUserService) {}

  /** GET /system/user/list：分页用户列表 */
  @Get('list')
  @ApiOperation({ summary: '分页查询用户列表' })
  @Permissions('AC_1000000')
  async list(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('username') username?: string,
    @Query('status') status?: string,
    @Query('deptId') deptId?: string,
  ) {
    const result = await this.userService.listUsers(
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      username,
      status !== undefined ? parseInt(status) : undefined,
      deptId,
    );
    return R.ok(result);
  }

  /** POST /system/user：新建用户 */
  @Post()
  @ApiOperation({ summary: '新建用户' })
  @Permissions('AC_100010')
  async create(@Body() dto: SystemUserSaveDto) {
    const id = await this.userService.createUser(dto);
    return R.ok(id);
  }

  /** PUT /system/user/:id：更新用户 */
  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @Permissions('AC_100020')
  async update(@Param('id') id: string, @Body() dto: SystemUserSaveDto) {
    await this.userService.updateUser(id, dto);
    return R.ok();
  }

  /** DELETE /system/user/:id：删除用户 */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @Permissions('AC_100030')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    await this.userService.deleteUser(id, currentUserId);
    return R.ok();
  }

  /** POST /system/user/:id/reset-password：重置密码 */
  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @Permissions('AC_100020')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    await this.userService.resetPassword(id, dto.newPassword);
    return R.ok();
  }

  /** GET /system/user/export：导出用户列表 */
  @Get('export')
  @ApiOperation({ summary: '导出用户列表' })
  @Permissions('AC_1000000')
  async export(
    @Query('username') username?: string,
    @Query('status') status?: string,
    @Query('deptId') deptId?: string,
  ) {
    const data = await this.userService.exportUsers(
      username,
      status !== undefined ? parseInt(status) : undefined,
      deptId,
    );
    return R.ok(data);
  }
}
