import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    id: number;
    pid: number;
    name: string;
    status: 0 | 1;
    remark?: string;
    createTime?: string;
  }
}

/**
 * 部门列表（扁平数组）
 */
async function getDeptList(params?: Recordable<any>) {
  return requestClient.get<SystemDeptApi.SystemDept[]>('/system/dept/list', {
    params,
  });
}

async function createDept(data: Recordable<any>) {
  return requestClient.post<number>('/system/dept', data);
}

async function updateDept(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/dept/${id}`, data);
}

async function deleteDept(id: number) {
  return requestClient.delete(`/system/dept/${id}`);
}

export { createDept, deleteDept, getDeptList, updateDept };
