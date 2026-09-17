import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PageResult } from '../../../common/result';
import dayjs = require('dayjs');

@Injectable()
export class SystemAuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number, module?: string, entityType?: string, operation?: string) {
    const where: any = {};
    if (module) where.module = { contains: module };
    if (entityType) where.entityType = { contains: entityType };
    if (operation) where.operation = operation;
    const [items, total] = await Promise.all([
      this.prisma.sysAuditLog.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysAuditLog.count({ where }),
    ]);
    return new PageResult(
      items.map((a) => ({
        id: a.id.toString(),
        userId: a.userId.toString(),
        username: a.username,
        module: a.module,
        operation: a.operation,
        entityType: a.entityType,
        entityId: a.entityId,
        oldData: a.oldData,
        newData: a.newData,
        changedFields: a.changedFields,
        ip: a.ip,
        createTime: dayjs(a.createTime).format('YYYY/MM/DD HH:mm:ss'),
      })),
      total,
    );
  }
}
