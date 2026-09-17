import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemAttachmentController } from './system-attachment.controller.js';
import { SystemAttachmentService } from './system-attachment.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemAttachmentController],
  providers: [SystemAttachmentService],
})
export class SystemAttachmentModule {}
