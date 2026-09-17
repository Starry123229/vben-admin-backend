import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemNoticeController } from './system-notice.controller.js';
import { SystemNoticeService } from './system-notice.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemNoticeController],
  providers: [SystemNoticeService],
  exports: [SystemNoticeService],
})
export class SystemNoticeModule {}
