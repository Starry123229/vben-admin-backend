import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Prisma');

  async onModuleInit() {
    await this.$connect()
      .then(() => this.logger.log('数据库连接成功'))
      .catch((err) => {
        this.logger.error('数据库连接失败', err.message);
        throw err;
      });
  }
}
