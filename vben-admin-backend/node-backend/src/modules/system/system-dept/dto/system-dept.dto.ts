import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 部门保存请求体 — 对标 Java DeptSaveRequest */
export class DeptSaveDto {
  @ApiPropertyOptional({ description: '部门 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: '父部门 ID（根为 0）' })
  @IsOptional()
  @IsString()
  pid?: string;

  @ApiProperty({ description: '部门名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

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
