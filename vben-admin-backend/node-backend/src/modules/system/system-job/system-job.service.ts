import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ServiceException } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemJobService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<any[]> {
    const jobs = await this.prisma.sysJob.findMany({ orderBy: { id: 'desc' } });
    return jobs.map((j) => ({
      id: j.id.toString(), name: j.name, groupName: j.groupName,
      invokeTarget: j.invokeTarget, cron: j.cron, status: j.status,
      remark: j.remark, createTime: dayjs(j.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }

  async create(data: any): Promise<string> {
    if (!data.name) throw ServiceException.badRequest('任务名称不能为空');
    if (!data.invokeTarget) throw ServiceException.badRequest('调用目标不能为空');
    if (!data.cron) throw ServiceException.badRequest('cron 表达式不能为空');
    const job = await this.prisma.sysJob.create({
      data: {
        name: data.name, groupName: data.groupName || 'DEFAULT',
        invokeTarget: data.invokeTarget, cron: data.cron,
        status: data.status ?? 0, remark: data.remark || null,
        createTime: dayjs().toDate(),
      },
    });
    return job.id.toString();
  }

  async update(id: string, data: any): Promise<void> {
    const jobId = BigInt(id);
    const job = await this.prisma.sysJob.findUnique({ where: { id: jobId } });
    if (!job) throw ServiceException.badRequest('任务不存在');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.groupName !== undefined) updateData.groupName = data.groupName;
    if (data.invokeTarget !== undefined) updateData.invokeTarget = data.invokeTarget;
    if (data.cron !== undefined) updateData.cron = data.cron;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remark !== undefined) updateData.remark = data.remark || null;
    await this.prisma.sysJob.update({ where: { id: jobId }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    const jobId = BigInt(id);
    const job = await this.prisma.sysJob.findUnique({ where: { id: jobId } });
    if (!job) throw ServiceException.badRequest('任务不存在');
    await this.prisma.sysJob.delete({ where: { id: jobId } });
  }

  async toggle(id: string): Promise<void> {
    const jobId = BigInt(id);
    const job = await this.prisma.sysJob.findUnique({ where: { id: jobId } });
    if (!job) throw ServiceException.badRequest('任务不存在');
    await this.prisma.sysJob.update({ where: { id: jobId }, data: { status: job.status === 1 ? 0 : 1 } });
  }
}
