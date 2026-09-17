import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemWorkflowController } from './system-workflow.controller';
import { SystemWorkflowService } from './system-workflow.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [SystemWorkflowController],
  providers: [SystemWorkflowService],
})
export class SystemWorkflowModule {}
