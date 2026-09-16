import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  RegisterDto,
  SendSmsDto,
  PhoneLoginDto,
  SendResetCodeDto,
  ForgotResetDto,
} from './dto/auth-ext.dto';
import { R } from '../../common/result';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('config')
  @ApiOperation({ summary: '登录方式开关（公开）' })
  config() {
    return R.ok({
      account: process.env.LOGIN_METHODS_ACCOUNT === 'true',
      phone: process.env.LOGIN_METHODS_PHONE === 'true',
      qrcode: process.env.LOGIN_METHODS_QRCODE === 'true',
      register: process.env.LOGIN_METHODS_REGISTER === 'true',
      oauth: process.env.LOGIN_METHODS_OAUTH === 'true',
    });
  }

  @Post('login')
  @ApiOperation({ summary: '账号密码登录' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    const accessToken = await this.authService.login(
      dto.username,
      dto.password,
      request,
      reply,
    );
    return R.ok({ accessToken });
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新 accessToken（Cookie 中的 refreshToken）' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    const token = await this.authService.refresh(request, reply);
    reply.type('text/plain').send(token);
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    await this.authService.logout(request, reply);
    return R.ok('');
  }

  @Get('codes')
  @ApiOperation({ summary: '当前用户按钮权限码' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async codes(@CurrentUser('id') userId: string) {
    return R.ok(await this.authService.getCodes(BigInt(userId)));
  }

  // ============================== 扩展认证端点

  @Post('register')
  @ApiOperation({ summary: '注册并自动登录' })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    if (process.env.LOGIN_METHODS_REGISTER !== 'true') {
      throw new Error('注册已关闭');
    }
    const accessToken = await this.authService.register(dto, request, reply);
    return R.ok({ accessToken });
  }

  @Post('sms/send')
  @ApiOperation({ summary: '发送短信验证码' })
  async sendSms(@Body() dto: SendSmsDto) {
    if (process.env.LOGIN_METHODS_PHONE !== 'true') {
      throw new Error('手机号登录已关闭');
    }
    return R.ok(await this.authService.sendSms(dto.phone));
  }

  @Post('phone-login')
  @ApiOperation({ summary: '手机号验证码登录' })
  async phoneLogin(
    @Body() dto: PhoneLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    if (process.env.LOGIN_METHODS_PHONE !== 'true') {
      throw new Error('手机号登录已关闭');
    }
    const accessToken = await this.authService.phoneLogin(dto.phone, dto.code, request, reply);
    return R.ok({ accessToken });
  }

  @Get('qr/create')
  @ApiOperation({ summary: '生成二维码登录 ticket' })
  async createQr() {
    if (process.env.LOGIN_METHODS_QRCODE !== 'true') {
      throw new Error('扫码登录已关闭');
    }
    return R.ok(await this.authService.createQrTicket());
  }

  @Get('qr/poll')
  @ApiOperation({ summary: '轮询二维码登录状态' })
  @ApiQuery({ name: 'ticket', description: '二维码 ticket' })
  async pollQr(
    @Query('ticket') ticket: string,
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    if (process.env.LOGIN_METHODS_QRCODE !== 'true') {
      throw new Error('扫码登录已关闭');
    }
    return R.ok(await this.authService.pollQrTicket(ticket, request, reply));
  }

  @Get('oauth/:provider/url')
  @ApiOperation({ summary: '获取 OAuth 授权 URL' })
  async oauthUrl(@Param('provider') provider: string) {
    if (process.env.LOGIN_METHODS_OAUTH !== 'true') {
      throw new Error('第三方登录已关闭');
    }
    return R.ok(this.authService.getOAuthUrl(provider));
  }

  @Get('oauth/callback/:provider')
  @ApiOperation({ summary: 'OAuth 回调登录' })
  async oauthCallback(
    @Param('provider') provider: string,
    @Req() request: Request,
    @Res({ passthrough: true }) reply: Response,
  ) {
    if (process.env.LOGIN_METHODS_OAUTH !== 'true') {
      throw new Error('第三方登录已关闭');
    }
    const accessToken = await this.authService.oauthCallback(provider, request, reply);
    return R.ok({ accessToken });
  }

  @Post('forgot/send')
  @ApiOperation({ summary: '发送密码重置验证码' })
  async sendResetCode(@Body() dto: SendResetCodeDto) {
    return R.ok(await this.authService.sendResetCode(dto.email));
  }

  @Post('forgot/reset')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() dto: ForgotResetDto) {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    return R.ok();
  }
}
