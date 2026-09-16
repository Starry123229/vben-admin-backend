import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 注册请求体 */
export class RegisterDto {
  @ApiProperty({ example: 'newuser', description: '登录名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '张三', description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ example: '13800138000', description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string;
}

/** 发送短信验证码 */
export class SendSmsDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

/** 手机号登录 */
export class PhoneLoginDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: '短信验证码' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

/** 发送密码重置验证码 */
export class SendResetCodeDto {
  @ApiProperty({ example: 'user@example.com', description: '邮箱' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

/** 密码重置（忘记密码） */
export class ForgotResetDto {
  @ApiProperty({ example: 'user@example.com', description: '邮箱' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '验证码' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'newpassword', description: '新密码' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
