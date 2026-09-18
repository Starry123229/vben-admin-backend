import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FileController } from './file.controller.js';
import { FileService } from './file.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'dev_secret' })],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
