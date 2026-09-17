import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 用户保存（新建/更新）请求体 — 对标 Java UserSaveRequest */
export class SystemUserSaveDto {
  @ApiPropertyOptional({ description: '用户 ID（更新时必填）' })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: '登录名' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '密码（新建必填；更新时为空表示不修改）' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '登录后首页路径' })
  @IsOptional()
  @IsString()
  homePath?: string;

  @ApiPropertyOptional({ description: '部门 ID' })
  @IsOptional()
  @IsString()
  deptId?: string;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用' })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '关联角色 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

/** 重置密码请求体 */
export class ResetPasswordDto {
  @ApiPropertyOptional({ description: '新密码' })
  @IsOptional()
  @IsString()
  newPassword?: string;
}
