import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemMessageController } from './system-message.controller.js';
import { SystemMessageService } from './system-message.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemMessageController],
  providers: [SystemMessageService],
})
export class SystemMessageModule {}
