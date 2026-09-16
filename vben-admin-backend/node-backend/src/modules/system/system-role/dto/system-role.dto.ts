import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 角色保存（新建/更新）请求体 — 对标 Java RoleSaveRequest */
export class RoleSaveDto {
  @ApiPropertyOptional({ description: '角色 ID（更新时必填）' })
  @IsOptional()
  id?: string;

  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '角色编码（super/admin/user 等，唯一）' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用' })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/** 角色菜单分配请求体 — 对标 Java AssignMenuRequest */
export class AssignMenuDto {
  @ApiPropertyOptional({ description: '菜单 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  menuIds?: string[];
}
