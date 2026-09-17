import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemAuditLogController } from './system-audit-log.controller';
import { SystemAuditLogService } from './system-audit-log.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemAuditLogController],
  providers: [SystemAuditLogService],
})
export class SystemAuditLogModule {}
