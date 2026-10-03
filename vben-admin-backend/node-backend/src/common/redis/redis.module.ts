import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service.js';

/**
 * Redis 全局模块：所有模块均可注入 RedisService。
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
