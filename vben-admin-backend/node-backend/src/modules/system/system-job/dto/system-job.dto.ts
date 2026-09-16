import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 定时任务保存 */
export class SystemJobSaveDto {
  @ApiPropertyOptional({ description: '任务 ID（更新时必填）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: '任务名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '任务分组', default: 'DEFAULT' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ description: '调用目标（类名#方法名）' })
  @IsString()
  @IsNotEmpty()
  invokeTarget: string;

  @ApiProperty({ description: 'cron 表达式', example: '0/5 * * * * ?' })
  @IsString()
  @IsNotEmpty()
  cron: string;

  @ApiPropertyOptional({ description: '状态：0 停用 / 1 启用', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
