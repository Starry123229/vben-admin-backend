import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule {}
