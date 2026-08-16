import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: number;
    username: string;
    realName?: string;
    avatar?: string;
    homePath?: string;
    deptId?: number;
    status: 0 | 1;
    remark?: string;
    createTime?: string;
    roleIds?: number[];
    roleCodes?: string[];
  }
}

/**
 * 分页用户列表：返回 { items, total }
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemUserApi.SystemUser[];
    total: number;
  }>('/system/user/list', { params });
}

async function createUser(data: Recordable<any>) {
  return requestClient.post<number>('/system/user', data);
}

async function updateUser(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/user/${id}`, data);
}

async function deleteUser(id: number) {
  return requestClient.delete(`/system/user/${id}`);
}

async function resetUserPassword(id: number, newPassword: string) {
  return requestClient.post(`/system/user/${id}/reset-password`, {}, {
    params: { newPassword },
  });
}

export {
  createUser,
  deleteUser,
  getUserList,
  resetUserPassword,
  updateUser,
};
