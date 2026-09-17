import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemUserController } from './system-user.controller.js';
import { SystemUserService } from './system-user.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_secret',
    }),
  ],
  controllers: [SystemUserController],
  providers: [SystemUserService],
  exports: [SystemUserService],
})
export class SystemUserModule {}
