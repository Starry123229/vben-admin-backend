import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class ProfileUpdateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  intro?: string;
}
