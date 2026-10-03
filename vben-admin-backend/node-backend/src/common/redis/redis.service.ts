import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis 服务：封装 ioredis，提供 get/set/del/incr/exists 等基础操作。
 * 所有 Key 统一加前缀 "vben:"，与 Java 端保持一致。
 */
@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger('RedisService');
  private client!: Redis;
  private readonly prefix = 'vben:';

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis 连接成功');
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Redis 连接错误: ${err.message}`);
    });
  }

  private key(k: string): string {
    return k.startsWith(this.prefix) ? k : this.prefix + k;
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(this.key(key));
    if (val === null) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }

  async getRaw(key: string): Promise<string | null> {
    return this.client.get(this.key(key));
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(this.key(key), val, 'EX', ttlSeconds);
    } else {
      await this.client.set(this.key(key), val);
    }
  }

  async setRaw(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(this.key(key), value, 'EX', ttlSeconds);
    } else {
      await this.client.set(this.key(key), value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.key(key));
  }

  async delByPattern(pattern: string): Promise<void> {
    const fullPattern = this.key(pattern);
    const keys = await this.client.keys(fullPattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const count = await this.client.incr(this.key(key));
    if (count === 1 && ttlSeconds) {
      await this.client.expire(this.key(key), ttlSeconds);
    }
    return count;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(this.key(key))) === 1;
  }

  async getTtl(key: string): Promise<number> {
    return this.client.ttl(this.key(key));
  }

  /** 获取原生 ioredis 客户端（特殊场景使用） */
  getClient(): Redis {
    return this.client;
  }
}
