import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OnlineController } from './online.controller.js';
import { OnlineUserService } from './online.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [OnlineController],
  providers: [OnlineUserService],
})
export class OnlineModule {}
