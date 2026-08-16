import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  export interface SystemMenu {
    [key: string]: any;
    id: number;
    pid: number;
    name: string;
    type: string;
    path: string;
    component?: string;
    redirect?: string;
    authCode?: string;
    icon?: string;
    status: 0 | 1;
    sort?: number;
    /** 后端以 JSON 字符串返回，前端按需解析为对象 */
    meta?: any;
    createTime?: string;
    updateTime?: string;
  }

  export const MenuTypeOptions = [
    { label: '目录', value: 'catalog' },
    { label: '菜单', value: 'menu' },
    { label: '按钮', value: 'button' },
    { label: '内嵌', value: 'embedded' },
    { label: '外链', value: 'link' },
  ];
}

/**
 * 菜单扁平列表
 */
async function getMenuList() {
  return requestClient.get<SystemMenuApi.SystemMenu[]>('/system/menu/list');
}

/**
 * 菜单树（权限分配 / 上级选择用，meta 已解析为对象）
 */
async function getMenuTree() {
  return requestClient.get<any[]>('/system/menu/tree');
}

async function isMenuNameExists(name: string, id?: number) {
  const params: Recordable<any> = { name };
  if (id != null) {
    params.id = id;
  }
  return requestClient.get<boolean>('/system/menu/name-exists', { params });
}

async function isMenuPathExists(path: string, id?: number) {
  const params: Recordable<any> = { path };
  if (id != null) {
    params.id = id;
  }
  return requestClient.get<boolean>('/system/menu/path-exists', { params });
}

async function createMenu(data: Recordable<any>) {
  return requestClient.post<number>('/system/menu', data);
}

async function updateMenu(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/menu/${id}`, data);
}

async function deleteMenu(id: number) {
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuList,
  getMenuTree,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
