import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemMenuController } from './system-menu.controller';
import { SystemMenuService } from './system-menu.service';

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
