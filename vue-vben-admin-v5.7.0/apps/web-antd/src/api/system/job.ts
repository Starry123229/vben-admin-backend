import type { Recordable } from '@vben/types';
import { requestClient } from '#/api/request';

async function getJobList() {
  return requestClient.get<any[]>('/system/job/list');
}
async function createJob(data: Recordable<any>) {
  return requestClient.post<number>('/system/job', data);
}
async function updateJob(id: number, data: Recordable<any>) {
  return requestClient.put(`/system/job/${id}`, data);
}
async function deleteJob(id: number) {
  return requestClient.delete(`/system/job/${id}`);
}
async function toggleJob(id: number) {
  return requestClient.put(`/system/job/${id}/toggle`);
}
async function runJob(id: number) {
  return requestClient.put(`/system/job/${id}/run`);
}

export { createJob, deleteJob, getJobList, runJob, toggleJob, updateJob };
