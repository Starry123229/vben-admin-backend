import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 字典类型保存 */
export class DictTypeSaveDto {
  @ApiPropertyOptional({ description: '字典类型 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: '字典名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '字典编码（唯一）' })
  @IsString()
  @IsNotEmpty()
  code: string;

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

  @ApiProperty({ description: '字典类型 ID' })
  @IsString()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({ description: '字典标签' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: '字典值' })
  @IsString()
  @IsNotEmpty()
  value: string;

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
