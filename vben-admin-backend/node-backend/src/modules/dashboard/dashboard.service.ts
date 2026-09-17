import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** 概览统计 */
  async overview(): Promise<any> {
    const [totalUsers, activeUsers, disabledUsers, totalRoles, totalMenus, totalDepts] = await Promise.all([
      this.prisma.sysUser.count(),
      this.prisma.sysUser.count({ where: { status: 1 } }),
      this.prisma.sysUser.count({ where: { status: 0 } }),
      this.prisma.sysRole.count(),
      this.prisma.sysMenu.count(),
      this.prisma.sysDept.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      disabledUsers,
      totalRoles,
      totalDepts,
      totalMenus,
    };
  }

  /** 用户增长趋势（最近7天） */
  async userTrends(): Promise<any[]> {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const start = date.startOf('day').toDate();
      const end = date.endOf('day').toDate();
      const count = await this.prisma.sysUser.count({
        where: { createTime: { gte: start, lte: end } },
      });
      result.push({ month: date.format('YYYY-MM'), count });
    }
    return result;
  }

  /** 角色分布 */
  async roleDistribution(): Promise<any[]> {
    const roles = await this.prisma.sysRole.findMany();
    const result = [];
    for (const role of roles) {
      const count = await this.prisma.sysUserRole.count({
        where: { roleId: role.id },
      });
      result.push({ name: role.name, code: role.code, count: count.toString() });
    }
    return result;
  }

  /** 部门用户分布 */
  async deptDistribution(): Promise<any[]> {
    const depts = await this.prisma.sysDept.findMany();
    const result = [];
    for (const dept of depts) {
      const count = await this.prisma.sysUser.count({
        where: { deptId: dept.id },
      });
      result.push({ name: dept.name, count: count.toString() });
    }
    return result;
  }

  /** 浏览器分布（来源：登录日志） */
  async browserDistribution(): Promise<any[]> {
    const logs = await this.prisma.sysLoginLog.findMany({
      where: { browser: { not: null } },
      select: { browser: true },
    });
    const counts: Record<string, number> = {};
    for (const log of logs) {
      if (log.browser) {
        const key = log.browser.split(' ')[0];
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count: count.toString() }));
  }
}
