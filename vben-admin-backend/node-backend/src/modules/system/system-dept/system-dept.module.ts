import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemDeptController } from './system-dept.controller';
import { SystemDeptService } from './system-dept.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemDeptController],
  providers: [SystemDeptService],
  exports: [SystemDeptService],
})
export class SystemDeptModule {}
