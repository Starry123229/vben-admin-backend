import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 字典类型保存 */
export class DictTypeSaveDto {
  @ApiPropertyOptional({ description: '字典类型 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: '字典名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '字典编码（唯一）' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/** 字典数据保存 */
export class DictDataSaveDto {
  @ApiPropertyOptional({ description: '字典数据 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: '字典类型 ID' })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiPropertyOptional({ description: '字典标签' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '字典值' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: '排序（小在前）', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: 'CSS 样式类名' })
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
