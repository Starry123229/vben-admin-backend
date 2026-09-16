import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 发送通知给指定用户 */
export class SendNoticeDto {
  @ApiProperty({ description: '接收用户 ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '通知标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '通知内容' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '跳转链接' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: '通知类型（info/success/warning/error）', default: 'info' })
  @IsOptional()
  @IsString()
  type?: string;
}

/** 按角色广播通知 */
export class BroadcastNoticeDto {
  @ApiProperty({ description: '角色 ID' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ description: '通知标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '通知内容' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '跳转链接' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: '通知类型（info/success/warning/error）', default: 'info' })
  @IsOptional()
  @IsString()
  type?: string;
}
