import { requestClient } from '#/api/request';

export namespace AuditLogApi {
  export interface AuditLogItem {
    id: number | string;
    userId: number;
    username?: string;
    module?: string;
    operation?: string;
    entityType?: string;
    entityId?: string;
    oldData?: string;
    newData?: string;
    changedFields?: string;
    ip?: string;
    createTime?: string;
  }
}

/** 分页查询审计日志 */
export async function getAuditLogListApi(params: {
  page?: number;
  pageSize?: number;
  module?: string;
  entityType?: string;
  operation?: string;
}) {
  return requestClient.get<{
    items: AuditLogApi.AuditLogItem[];
    total: number;
  }>('/system/audit-log/list', { params });
}
