import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: number;
    name: string;
    code: string;
    status: 0 | 1;
    remark?: string;
    createTime?: string;
  }
}

/**
 * 分页角色列表：返回 { items, total }
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemRoleApi.SystemRole[];
    total: number;
  }>('/system/role/list', { params });
}

async function createRole(data: Recordable<any>) {
  return requestClient.post<number>('/system/role', data);
}

async function updateRole(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/role/${id}`, data);
}

async function deleteRole(id: number) {
  return requestClient.delete(`/system/role/${id}`);
}

async function getRoleMenus(id: number) {
  return requestClient.get<number[]>(`/system/role/${id}/menus`);
}

async function assignRoleMenus(id: number, data: { menuIds: number[] }) {
  return requestClient.post(`/system/role/${id}/menus`, data);
}

export {
  assignRoleMenus,
  createRole,
  deleteRole,
  getRoleList,
  getRoleMenus,
  updateRole,
};
