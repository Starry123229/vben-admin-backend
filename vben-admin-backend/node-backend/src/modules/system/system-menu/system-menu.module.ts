import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemMenuController } from './system-menu.controller.js';
import { SystemMenuService } from './system-menu.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_secret',
    }),
  ],
  controllers: [SystemMenuController],
  providers: [SystemMenuService],
  exports: [SystemMenuService],
})
export class SystemMenuModule {}
