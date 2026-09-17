import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PageResult, ServiceException } from '../../../common/result';
import dayjs = require('dayjs');

@Injectable()
export class SystemWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number, name?: string) {
    const where: any = {};
    if (name) where.name = { contains: name };
    const [items, total] = await Promise.all([
      this.prisma.sysWorkflow.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysWorkflow.count({ where }),
    ]);
    return new PageResult(
      items.map((w) => ({
        id: w.id.toString(),
        name: w.name,
        code: w.code,
        type: w.type,
        definition: w.definition,
        status: w.status,
        remark: w.remark,
        createTime: dayjs(w.createTime).format('YYYY/MM/DD HH:mm:ss'),
      })),
      total,
    );
  }

  async create(data: { name: string; code: string; type?: string; definition?: string; status?: number; remark?: string }): Promise<string> {
    if (!data.name) throw ServiceException.badRequest('工作流名称不能为空');
    if (!data.code) throw ServiceException.badRequest('工作流编码不能为空');
    const existing = await this.prisma.sysWorkflow.findUnique({ where: { code: data.code } });
    if (existing) throw ServiceException.badRequest('工作流编码已存在');
    const w = await this.prisma.sysWorkflow.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type || 'approval',
        definition: data.definition || null,
        status: Number(data.status ?? 1),
        remark: data.remark || null,
        createTime: dayjs().toDate(),
      },
    });
    return w.id.toString();
  }

  async update(id: string, data: any): Promise<void> {
    const workflowId = BigInt(id);
    const w = await this.prisma.sysWorkflow.findUnique({ where: { id: workflowId } });
    if (!w) throw ServiceException.badRequest('工作流不存在');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined && data.code !== w.code) {
      const dup = await this.prisma.sysWorkflow.findUnique({ where: { code: data.code } });
      if (dup) throw ServiceException.badRequest('工作流编码已存在');
      updateData.code = data.code;
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.definition !== undefined) updateData.definition = data.definition;
    if (data.status !== undefined) updateData.status = Number(data.status);
    if (data.remark !== undefined) updateData.remark = data.remark || null;
    await this.prisma.sysWorkflow.update({ where: { id: workflowId }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sysWorkflow.delete({ where: { id: BigInt(id) } }).catch(() => {
      throw ServiceException.badRequest('工作流不存在');
    });
  }

  async start(workflowId: number, applicantId: bigint, applicantName: string, title: string, content?: string, bizType?: string, bizId?: string): Promise<string> {
    const w = await this.prisma.sysWorkflow.findUnique({ where: { id: BigInt(workflowId) } });
    if (!w) throw ServiceException.badRequest('工作流不存在');
    if (w.status !== 1) throw ServiceException.badRequest('工作流已停用');

    const instance = await this.prisma.sysWorkflowInstance.create({
      data: {
        workflowId: BigInt(workflowId),
        workflowName: w.name,
        applicantId,
        applicantName,
        title,
        content: content || null,
        currentStep: 0,
        totalSteps: 0,
        status: 'pending',
        bizType: bizType || null,
        bizId: bizId || null,
        createTime: dayjs().toDate(),
      },
    });
    return instance.id.toString();
  }

  async approve(instanceId: string, action: string, comment?: string, approverId?: bigint, approverName?: string): Promise<void> {
    const instId = BigInt(instanceId);
    const inst = await this.prisma.sysWorkflowInstance.findUnique({ where: { id: instId } });
    if (!inst) throw ServiceException.badRequest('审批实例不存在');
    if (inst.status !== 'pending') throw ServiceException.badRequest('该审批已处理');

    const now = dayjs().toDate();
    await this.prisma.sysWorkflowTask.create({
      data: {
        instanceId: instId,
        step: inst.currentStep + 1,
        approverId: approverId || 0n,
        approverName: approverName || null,
        action,
        comment: comment || null,
        approveTime: now,
      },
    });

    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'cancelled';
    await this.prisma.sysWorkflowInstance.update({
      where: { id: instId },
      data: {
        currentStep: inst.currentStep + 1,
        status: newStatus,
        finishTime: now,
      },
    });
  }

  async cancel(instanceId: string): Promise<void> {
    const instId = BigInt(instanceId);
    const inst = await this.prisma.sysWorkflowInstance.findUnique({ where: { id: instId } });
    if (!inst) throw ServiceException.badRequest('审批实例不存在');
    if (inst.status !== 'pending') throw ServiceException.badRequest('该审批已处理');
    await this.prisma.sysWorkflowInstance.update({
      where: { id: instId },
      data: { status: 'cancelled', finishTime: dayjs().toDate() },
    });
  }

  async instances(page: number, pageSize: number, status?: string, applicantId?: bigint) {
    const where: any = {};
    if (status) where.status = status;
    if (applicantId) where.applicantId = applicantId;
    const [items, total] = await Promise.all([
      this.prisma.sysWorkflowInstance.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysWorkflowInstance.count({ where }),
    ]);
    return new PageResult(
      items.map((i) => ({
        id: i.id.toString(),
        workflowId: i.workflowId.toString(),
        workflowName: i.workflowName,
        applicantId: i.applicantId.toString(),
        applicantName: i.applicantName,
        title: i.title,
        content: i.content,
        currentStep: i.currentStep,
        totalSteps: i.totalSteps,
        status: i.status,
        bizType: i.bizType,
        bizId: i.bizId,
        createTime: dayjs(i.createTime).format('YYYY/MM/DD HH:mm:ss'),
        finishTime: i.finishTime ? dayjs(i.finishTime).format('YYYY/MM/DD HH:mm:ss') : null,
      })),
      total,
    );
  }

  async tasks(instanceId: string) {
    const tasks = await this.prisma.sysWorkflowTask.findMany({
      where: { instanceId: BigInt(instanceId) },
      orderBy: { step: 'asc' },
    });
    return tasks.map((t) => ({
      id: t.id.toString(),
      instanceId: t.instanceId.toString(),
      step: t.step,
      approverId: t.approverId.toString(),
      approverName: t.approverName,
      action: t.action,
      comment: t.comment,
      approveTime: dayjs(t.approveTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }
}
