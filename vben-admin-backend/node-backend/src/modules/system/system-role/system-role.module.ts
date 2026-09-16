import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemRoleController } from './system-role.controller';
import { SystemRoleService } from './system-role.service';

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
