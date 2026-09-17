import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Prisma');

  constructor() {
    // Prisma 7 要求使用 driver adapter，直接传 connection string
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect()
      .then(() => this.logger.log('数据库连接成功'))
      .catch((err) => {
        this.logger.error('数据库连接失败', err.message);
        throw err;
      });
  }
}
