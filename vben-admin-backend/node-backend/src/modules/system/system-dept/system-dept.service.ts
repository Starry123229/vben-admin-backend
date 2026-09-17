import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ServiceException } from '../../../common/result.js';
import { DeptSaveDto } from './dto/system-dept.dto.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemDeptService {
  constructor(private readonly prisma: PrismaService) {}

  /** 部门列表（扁平，前端自行组树） */
  async list(keyword?: string): Promise<any[]> {
    const where: any = {};
    if (keyword) {
      where.name = { contains: keyword };
    }
    const depts = await this.prisma.sysDept.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return depts.map((d) => ({
      id: d.id.toString(),
      pid: d.pid.toString(),
      name: d.name,
      status: d.status,
      remark: d.remark,
      createTime: d.createTime
        ? dayjs(d.createTime).format('YYYY/MM/DD HH:mm:ss')
        : null,
    }));
  }

  /** 新建部门 */
  async create(dto: DeptSaveDto): Promise<string> {
    if (!dto.name) {
      throw ServiceException.badRequest('部门名称不能为空');
    }
    const dept = await this.prisma.sysDept.create({
      data: {
        pid: dto.pid ? BigInt(dto.pid) : 0n,
        name: dto.name,
        status: dto.status ?? 1,
        remark: dto.remark || null,
        createTime: dayjs().toDate(),
      },
    });
    return dept.id.toString();
  }

  /** 更新部门 */
  async update(id: string, dto: DeptSaveDto): Promise<void> {
    const deptId = BigInt(id);
    const dept = await this.prisma.sysDept.findUnique({
      where: { id: deptId },
    });
    if (!dept) {
      throw ServiceException.badRequest('部门不存在');
    }

    const data: any = {};
    if (dto.pid !== undefined) {
      if (BigInt(dto.pid || '0') === deptId) {
        throw ServiceException.badRequest('父部门不能为自身');
      }
      data.pid = dto.pid ? BigInt(dto.pid) : 0n;
    }
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.remark !== undefined) data.remark = dto.remark || null;

    await this.prisma.sysDept.update({
      where: { id: deptId },
      data,
    });
  }

  /** 删除部门：有子部门或用户则拒绝 */
  async remove(id: string): Promise<void> {
    const deptId = BigInt(id);
    const dept = await this.prisma.sysDept.findUnique({
      where: { id: deptId },
    });
    if (!dept) {
      throw ServiceException.badRequest('部门不存在');
    }

    const childCount = await this.prisma.sysDept.count({
      where: { pid: deptId },
    });
    if (childCount > 0) {
      throw ServiceException.badRequest('该部门存在子部门，无法删除');
    }

    const userCount = await this.prisma.sysUser.count({
      where: { deptId },
    });
    if (userCount > 0) {
      throw ServiceException.badRequest('该部门下存在用户，无法删除');
    }

    await this.prisma.sysDept.delete({
      where: { id: deptId },
    });
  }
}
