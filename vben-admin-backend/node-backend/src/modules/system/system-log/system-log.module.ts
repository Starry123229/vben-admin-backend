import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemLogController } from './system-log.controller';
import { SystemLogService } from './system-log.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemLogController],
  providers: [SystemLogService],
  exports: [SystemLogService],
})
export class SystemLogModule {}
