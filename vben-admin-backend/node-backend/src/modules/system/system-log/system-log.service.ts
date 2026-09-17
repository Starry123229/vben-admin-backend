import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemLogService {
  constructor(private readonly prisma: PrismaService) {}

  async operationList(page: number, pageSize: number, username?: string, module?: string, status?: number, startTime?: string, endTime?: string) {
    const where: any = {};
    if (username) where.username = { contains: username };
    if (module) where.module = { contains: module };
    if (status !== undefined && status !== null) where.status = status;
    if (startTime || endTime) {
      where.createTime = {};
      if (startTime) where.createTime.gte = new Date(startTime);
      if (endTime) where.createTime.lte = new Date(endTime);
    }
    const [logs, total] = await Promise.all([
      this.prisma.sysOperationLog.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysOperationLog.count({ where }),
    ]);
    const items = logs.map((l) => ({
      id: l.id.toString(), userId: l.userId?.toString() || null, username: l.username,
      module: l.module, description: l.description, method: l.method,
      requestUrl: l.requestUrl, requestMethod: l.requestMethod, requestParams: l.requestParams,
      ip: l.ip, status: l.status, errorMsg: l.errorMsg, costTime: l.costTime?.toString() || null,
      createTime: dayjs(l.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
    return new PageResult(items, total);
  }

  async loginList(page: number, pageSize: number, username?: string, status?: number, startTime?: string, endTime?: string) {
    const where: any = {};
    if (username) where.username = { contains: username };
    if (status !== undefined && status !== null) where.status = status;
    if (startTime || endTime) {
      where.createTime = {};
      if (startTime) where.createTime.gte = new Date(startTime);
      if (endTime) where.createTime.lte = new Date(endTime);
    }
    const [logs, total] = await Promise.all([
      this.prisma.sysLoginLog.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysLoginLog.count({ where }),
    ]);
    const items = logs.map((l) => ({
      id: l.id.toString(), userId: l.userId?.toString() || null, username: l.username,
      ip: l.ip, location: l.location, browser: l.browser, os: l.os,
      status: l.status, message: l.message, loginType: l.loginType,
      createTime: dayjs(l.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
    return new PageResult(items, total);
  }

  async exportOperationLogs(username?: string, module?: string, status?: number, startTime?: string, endTime?: string): Promise<any[]> {
    const where: any = {};
    if (username) where.username = { contains: username };
    if (module) where.module = { contains: module };
    if (status !== undefined && status !== null) where.status = status;
    if (startTime || endTime) {
      where.createTime = {};
      if (startTime) where.createTime.gte = new Date(startTime);
      if (endTime) where.createTime.lte = new Date(endTime);
    }
    const logs = await this.prisma.sysOperationLog.findMany({ where, orderBy: { createTime: 'desc' }, take: 1000 });
    return logs.map((l) => ({
      id: l.id.toString(), userId: l.userId?.toString() || null, username: l.username,
      module: l.module, description: l.description, method: l.method,
      requestUrl: l.requestUrl, requestMethod: l.requestMethod, requestParams: l.requestParams,
      ip: l.ip, status: l.status, errorMsg: l.errorMsg, costTime: l.costTime?.toString() || null,
      createTime: dayjs(l.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }

  async exportLoginLogs(username?: string, status?: number, startTime?: string, endTime?: string): Promise<any[]> {
    const where: any = {};
    if (username) where.username = { contains: username };
    if (status !== undefined && status !== null) where.status = status;
    if (startTime || endTime) {
      where.createTime = {};
      if (startTime) where.createTime.gte = new Date(startTime);
      if (endTime) where.createTime.lte = new Date(endTime);
    }
    const logs = await this.prisma.sysLoginLog.findMany({ where, orderBy: { createTime: 'desc' }, take: 1000 });
    return logs.map((l) => ({
      id: l.id.toString(), userId: l.userId?.toString() || null, username: l.username,
      ip: l.ip, location: l.location, browser: l.browser, os: l.os,
      status: l.status, message: l.message, loginType: l.loginType,
      createTime: dayjs(l.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }

  async clearOperationLogs(): Promise<void> {
    await this.prisma.sysOperationLog.deleteMany({});
  }

  async clearLoginLogs(): Promise<void> {
    await this.prisma.sysLoginLog.deleteMany({});
  }
}
