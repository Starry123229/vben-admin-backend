import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemRoleController } from './system-role.controller.js';
import { SystemRoleService } from './system-role.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_secret',
    }),
  ],
  controllers: [SystemRoleController],
  providers: [SystemRoleService],
  exports: [SystemRoleService],
})
export class SystemRoleModule {}
