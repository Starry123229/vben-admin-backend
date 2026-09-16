import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemJobController } from './system-job.controller';
import { SystemJobService } from './system-job.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemJobController],
  providers: [SystemJobService],
  exports: [SystemJobService],
})
export class SystemJobModule {}
