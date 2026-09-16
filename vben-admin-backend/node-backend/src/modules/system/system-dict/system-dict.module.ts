import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemDictController } from './system-dict.controller';
import { SystemDictService } from './system-dict.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemDictController],
  providers: [SystemDictService],
  exports: [SystemDictService],
})
export class SystemDictModule {}
