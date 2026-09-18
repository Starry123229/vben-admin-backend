import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller.js';

@Module({
  controllers: [AvatarController],
})
export class AvatarModule {}
