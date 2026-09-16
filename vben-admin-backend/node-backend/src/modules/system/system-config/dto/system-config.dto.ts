import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 系统参数配置保存 */
export class SystemConfigSaveDto {
  @ApiPropertyOptional({ description: '参数 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: '参数名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '参数键（唯一）' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({ description: '参数值', default: '' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: '参数类型（string/number/boolean/json）', default: 'string' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
