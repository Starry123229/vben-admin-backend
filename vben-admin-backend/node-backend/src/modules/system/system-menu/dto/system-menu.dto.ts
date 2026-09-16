import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 菜单保存（新建/更新）请求体 — 对标 Java MenuSaveRequest */
export class MenuSaveDto {
  @ApiPropertyOptional({ description: '菜单 ID（更新时必填）' })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: '父 ID（根为 0）' })
  @IsOptional()
  @IsString()
  pid?: string;

  @ApiProperty({ description: '路由名（唯一）' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '类型：catalog/menu/button/embedded/link' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '组件路径' })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiPropertyOptional({ description: '目录重定向目标' })
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiPropertyOptional({ description: '权限码（button 型使用）' })
  @IsOptional()
  @IsString()
  authCode?: string;

  @ApiPropertyOptional({ description: '图标（iconify 名）' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用' })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: '排序（小在前）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '前端 meta 的 JSON 字符串' })
  @IsOptional()
  @IsString()
  meta?: string;
}
