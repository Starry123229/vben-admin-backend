import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemNoticeController } from './system-notice.controller';
import { SystemNoticeService } from './system-notice.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemNoticeController],
  providers: [SystemNoticeService],
  exports: [SystemNoticeService],
})
export class SystemNoticeModule {}
