import { requestClient } from '#/api/request';

export namespace DashboardApi {
  export interface OverviewData {
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
    totalRoles: number;
    totalDepts: number;
    totalMenus: number;
  }

  export interface TrendItem {
    month: string;
    count: number;
  }

  export interface DistributionItem {
    name: string;
    value: number;
  }

  export interface WorkspaceData {
    totalUsers: number;
    totalRoles: number;
    totalDepts: number;
    totalMenus: number;
  }
}

/** 概览统计 */
export async function getOverviewApi() {
  return requestClient.get<DashboardApi.OverviewData>('/dashboard/overview');
}

/** 用户增长趋势 */
export async function getUserTrendsApi() {
  return requestClient.get<DashboardApi.TrendItem[]>('/dashboard/user-trends');
}

/** 角色分布 */
export async function getRoleDistributionApi() {
  return requestClient.get<DashboardApi.DistributionItem[]>(
    '/dashboard/role-distribution',
  );
}

/** 部门用户分布 */
export async function getDeptDistributionApi() {
  return requestClient.get<DashboardApi.DistributionItem[]>(
    '/dashboard/dept-distribution',
  );
}

/** 工作台数据 */
export async function getWorkspaceApi() {
  return requestClient.get<DashboardApi.WorkspaceData>('/dashboard/workspace');
}
