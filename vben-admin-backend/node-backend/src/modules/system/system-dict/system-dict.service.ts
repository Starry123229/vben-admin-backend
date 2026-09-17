import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult, ServiceException } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemDictService {
  constructor(private readonly prisma: PrismaService) {}

  // 字典类型
  async typeList(page: number, pageSize: number, name?: string, code?: string, status?: number) {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined && status !== null) where.status = status;

    const [types, total] = await Promise.all([
      this.prisma.sysDictType.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysDictType.count({ where }),
    ]);
    const items = types.map((t) => ({
      id: t.id.toString(), name: t.name, code: t.code, status: t.status,
      remark: t.remark, createTime: dayjs(t.createTime).format('YYYY/MM/DD HH:mm:ss'),
      updateTime: dayjs(t.updateTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
    return new PageResult(items, total);
  }

  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code };
    if (excludeId) where.NOT = { id: BigInt(excludeId) };
    return (await this.prisma.sysDictType.count({ where })) > 0;
  }

  async createType(data: any): Promise<string> {
    if (!data.name) throw ServiceException.badRequest('字典名称不能为空');
    if (!data.code) throw ServiceException.badRequest('字典编码不能为空');
    if (await this.codeExists(data.code)) throw ServiceException.badRequest('字典编码已存在');
    const now = dayjs().toDate();
    const t = await this.prisma.sysDictType.create({ data: { name: data.name, code: data.code, status: data.status ?? 1, remark: data.remark || null, createTime: now, updateTime: now } });
    return t.id.toString();
  }

  async updateType(id: string, data: any): Promise<void> {
    const typeId = BigInt(id);
    const t = await this.prisma.sysDictType.findUnique({ where: { id: typeId } });
    if (!t) throw ServiceException.badRequest('字典类型不存在');
    if (data.code && data.code !== t.code && (await this.codeExists(data.code, id))) throw ServiceException.badRequest('字典编码已存在');
    const updateData: any = { updateTime: dayjs().toDate() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remark !== undefined) updateData.remark = data.remark || null;
    await this.prisma.sysDictType.update({ where: { id: typeId }, data: updateData });
  }

  async deleteType(id: string): Promise<void> {
    const typeId = BigInt(id);
    const count = await this.prisma.sysDictData.count({ where: { typeId } });
    if (count > 0) throw ServiceException.badRequest('该字典类型下存在数据，无法删除');
    await this.prisma.sysDictType.delete({ where: { id: typeId } });
  }

  // 字典数据
  async dataList(typeId: string): Promise<any[]> {
    const list = await this.prisma.sysDictData.findMany({ where: { typeId: BigInt(typeId) }, orderBy: { sort: 'asc' } });
    return list.map((d) => ({
      id: d.id.toString(), typeId: d.typeId.toString(), label: d.label, value: d.value,
      sort: d.sort, status: d.status, cssClass: d.cssClass, remark: d.remark,
      createTime: dayjs(d.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }

  async createData(data: any): Promise<string> {
    if (!data.label) throw ServiceException.badRequest('字典标签不能为空');
    if (!data.value) throw ServiceException.badRequest('字典值不能为空');
    const d = await this.prisma.sysDictData.create({ data: { typeId: BigInt(data.typeId), label: data.label, value: data.value, sort: data.sort ?? 0, status: data.status ?? 1, cssClass: data.cssClass || null, remark: data.remark || null, createTime: dayjs().toDate() } });
    return d.id.toString();
  }

  async updateData(id: string, data: any): Promise<void> {
    const dataId = BigInt(id);
    const d = await this.prisma.sysDictData.findUnique({ where: { id: dataId } });
    if (!d) throw ServiceException.badRequest('字典数据不存在');
    const updateData: any = {};
    if (data.typeId !== undefined) updateData.typeId = BigInt(data.typeId);
    if (data.label !== undefined) updateData.label = data.label;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.sort !== undefined) updateData.sort = data.sort;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cssClass !== undefined) updateData.cssClass = data.cssClass || null;
    if (data.remark !== undefined) updateData.remark = data.remark || null;
    await this.prisma.sysDictData.update({ where: { id: dataId }, data: updateData });
  }

  async deleteData(id: string): Promise<void> {
    await this.prisma.sysDictData.delete({ where: { id: BigInt(id) } });
  }

  /** 按编码查字典数据（公开接口） */
  async dataByCode(code: string): Promise<any[]> {
    const type = await this.prisma.sysDictType.findUnique({ where: { code } });
    if (!type) return [];
    return this.dataList(type.id.toString());
  }
}
