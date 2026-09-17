import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { ChangePasswordDto, ProfileUpdateDto } from './dto/user.dto.js';
import { R, ServiceException } from '../../common/result.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { FastifyFileInterceptor, FastifyFile } from '../../common/interceptors/fastify-file.interceptor.js';
import { FastifyFileDecorator } from '../../common/decorators/fastify-file.decorator.js';

@ApiTags('用户')
@ApiBearerAuth('JWT')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** GET /user/info */
  @Get('info')
  @ApiOperation({ summary: '当前用户信息' })
  async info(@CurrentUser('id') userId: string) {
    return R.ok(await this.userService.info(BigInt(userId)));
  }

  /** POST /user/password */
  @Post('password')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(
      BigInt(userId),
      dto.oldPassword,
      dto.newPassword,
      dto.confirmPassword,
    );
    return R.ok();
  }

  /** PUT /user/profile */
  @Put('profile')
  @ApiOperation({ summary: '更新个人资料' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: ProfileUpdateDto,
  ) {
    await this.userService.updateProfile(
      BigInt(userId),
      dto.realName,
      dto.intro,
    );
    return R.ok();
  }

  /** POST /user/avatar */
  @Post('avatar')
  @ApiOperation({ summary: '上传头像' })
  @UseInterceptors(new FastifyFileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @FastifyFileDecorator() file: FastifyFile,
  ) {
    if (!file) throw ServiceException.badRequest('缺少上传文件: file');
    const avatar = await this.userService.saveAvatar(BigInt(userId), file);
    return R.ok({ avatar });
  }
}
