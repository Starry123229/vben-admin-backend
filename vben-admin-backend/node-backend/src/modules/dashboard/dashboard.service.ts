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

  /**
   * 用户增长趋势（最近12个月）
   * 优化：SQL GROUP BY 替代全表加载到内存
   */
  async userTrends(): Promise<any[]> {
    // 一次查询获取所有月份的计数
    const startDate = dayjs().subtract(11, 'month').startOf('month').toDate();
    const users = await this.prisma.sysUser.findMany({
      where: { createTime: { gte: startDate } },
      select: { createTime: true },
    });

    // 按月分组
    const monthlyCount: Record<string, number> = {};
    for (const user of users) {
      if (user.createTime) {
        const month = dayjs(user.createTime).format('YYYY-MM');
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      }
    }

    // 补齐最近 12 个月
    const result: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      const month = date.format('YYYY-MM');
      result.push({ month, count: monthlyCount[month] || 0 });
    }
    return result;
  }

  /**
   * 角色分布
   * 优化：使用 Prisma groupBy 替代 N+1 查询
   */
  async roleDistribution(): Promise<any[]> {
    // 1 次查询：按 roleId 分组统计
    const grouped = await this.prisma.sysUserRole.groupBy({
      by: ['roleId'],
      _count: { roleId: true },
    });

    // 1 次查询：批量获取角色名称
    const roleIds = grouped.map((g) => g.roleId);
    const roles = await this.prisma.sysRole.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true, code: true },
    });

    const roleMap = new Map(roles.map((r) => [r.id, r]));
    return grouped.map((g) => ({
      name: roleMap.get(g.roleId)?.name || 'Unknown',
      code: roleMap.get(g.roleId)?.code || '',
      count: g._count.roleId,
    }));
  }

  /**
   * 部门用户分布
   * 优化：使用 Prisma groupBy 替代 N+1 查询
   */
  async deptDistribution(): Promise<any[]> {
    // 1 次查询：按 deptId 分组统计
    const grouped = await this.prisma.sysUser.groupBy({
      by: ['deptId'],
      _count: { deptId: true },
    });

    // 1 次查询：批量获取部门名称
    const deptIds = grouped
      .map((g) => g.deptId)
      .filter((id): id is bigint => id !== null);
    const depts = await this.prisma.sysDept.findMany({
      where: { id: { in: deptIds } },
      select: { id: true, name: true },
    });

    const deptMap = new Map(depts.map((d) => [d.id, d.name]));
    return grouped.map((g) => ({
      name: g.deptId ? (deptMap.get(g.deptId) || 'Unknown') : '未分配',
      count: g._count.deptId,
    }));
  }

  /**
   * 浏览器分布（来源：登录日志）
   * 优化：使用 Prisma groupBy 替代全表加载到内存
   */
  async browserDistribution(): Promise<any[]> {
    const grouped = await this.prisma.sysLoginLog.groupBy({
      by: ['browser'],
      _count: { browser: true },
      where: {
        browser: { not: null, notIn: ['', 'Unknown'] },
      },
      orderBy: { _count: { browser: 'desc' } },
    });

    return grouped.map((g) => ({
      name: g.browser || '其他',
      count: g._count.browser,
    }));
  }
}
