import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult, ServiceException } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number, name?: string, key?: string) {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (key) where.key = { contains: key };
    const [configs, total] = await Promise.all([
      this.prisma.sysConfig.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysConfig.count({ where }),
    ]);
    const items = configs.map((c) => ({
      id: c.id.toString(), name: c.name, key: c.key, value: c.value,
      type: c.type, remark: c.remark,
      createTime: dayjs(c.createTime).format('YYYY/MM/DD HH:mm:ss'),
      updateTime: dayjs(c.updateTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
    return new PageResult(items, total);
  }

  async keyExists(key: string, excludeId?: string): Promise<boolean> {
    const where: any = { key };
    if (excludeId) where.NOT = { id: BigInt(excludeId) };
    return (await this.prisma.sysConfig.count({ where })) > 0;
  }

  async create(data: any): Promise<string> {
    if (!data.name) throw ServiceException.badRequest('参数名称不能为空');
    if (!data.key) throw ServiceException.badRequest('参数键不能为空');
    if (await this.keyExists(data.key)) throw ServiceException.badRequest('参数键已存在');
    const now = dayjs().toDate();
    const c = await this.prisma.sysConfig.create({ data: { name: data.name, key: data.key, value: data.value || '', type: data.type || 'string', remark: data.remark || null, createTime: now, updateTime: now } });
    return c.id.toString();
  }

  async update(id: string, data: any): Promise<void> {
    const configId = BigInt(id);
    const c = await this.prisma.sysConfig.findUnique({ where: { id: configId } });
    if (!c) throw ServiceException.badRequest('参数配置不存在');
    if (data.key && data.key !== c.key && (await this.keyExists(data.key, id))) throw ServiceException.badRequest('参数键已存在');
    const updateData: any = { updateTime: dayjs().toDate() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.key !== undefined) updateData.key = data.key;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.remark !== undefined) updateData.remark = data.remark || null;
    await this.prisma.sysConfig.update({ where: { id: configId }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sysConfig.delete({ where: { id: BigInt(id) } });
  }

  /** 按 key 查值（公开接口） */
  async getByKey(key: string): Promise<string | null> {
    const c = await this.prisma.sysConfig.findUnique({ where: { key } });
    return c?.value ?? null;
  }
}
