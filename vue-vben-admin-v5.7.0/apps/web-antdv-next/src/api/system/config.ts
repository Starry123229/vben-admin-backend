import type { Recordable } from '@vben/types';
import { requestClient } from '#/api/request';

async function getConfigList(params: Recordable<any>) {
  return requestClient.get<{ items: any[]; total: number }>('/system/config/list', { params });
}
async function getConfigByKey(key: string) {
  return requestClient.get<string>(`/system/config/key/${key}`);
}
async function createConfig(data: Recordable<any>) {
  return requestClient.post<number>('/system/config', data);
}
async function updateConfig(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/config/${id}`, data);
}
async function deleteConfig(id: number) {
  return requestClient.delete(`/system/config/${id}`);
}
async function isConfigKeyExists(key: string, id?: number) {
  const params: Recordable<any> = { key };
  if (id != null) params.id = id;
  return requestClient.get<boolean>('/system/config/key-exists', { params });
}

export { createConfig, deleteConfig, getConfigByKey, getConfigList, isConfigKeyExists, updateConfig };
