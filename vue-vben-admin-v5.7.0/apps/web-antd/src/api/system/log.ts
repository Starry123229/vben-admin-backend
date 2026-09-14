import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace LogApi {
  export interface OperationLog {
    id: number;
    userId?: number;
    username?: string;
    module?: string;
    description?: string;
    method?: string;
    requestUrl?: string;
    requestMethod?: string;
    requestParams?: string;
    ip?: string;
    status: 0 | 1;
    errorMsg?: string;
    costTime?: number;
    createTime?: string;
  }

  export interface LoginLog {
    id: number;
    userId?: number;
    username?: string;
    ip?: string;
    location?: string;
    browser?: string;
    os?: string;
    status: 0 | 1;
    message?: string;
    loginType?: string;
    createTime?: string;
  }
}

/** 操作日志分页列表 */
async function getOperationLogList(params: Recordable<any>) {
  return requestClient.get<{
    items: LogApi.OperationLog[];
    total: number;
  }>('/system/log/operation/list', { params });
}

/** 登录日志分页列表 */
async function getLoginLogList(params: Recordable<any>) {
  return requestClient.get<{
    items: LogApi.LoginLog[];
    total: number;
  }>('/system/log/login/list', { params });
}

/** 清空操作日志 */
async function clearOperationLogs() {
  return requestClient.delete('/system/log/operation');
}

/** 清空登录日志 */
async function clearLoginLogs() {
  return requestClient.delete('/system/log/login');
}

/** 导出操作日志 Excel */
async function exportOperationLog(params?: Recordable<any>) {
  const blob = await requestClient.download<Blob>('/system/log/operation/export', { params });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '操作日志.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

/** 导出登录日志 Excel */
async function exportLoginLog(params?: Recordable<any>) {
  const blob = await requestClient.download<Blob>('/system/log/login/export', { params });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '登录日志.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

export {
  clearLoginLogs,
  clearOperationLogs,
  exportLoginLog,
  exportOperationLog,
  getLoginLogList,
  getOperationLogList,
};
