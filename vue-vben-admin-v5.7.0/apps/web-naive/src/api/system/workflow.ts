import { requestClient } from '#/api/request';

export namespace WorkflowApi {
  export interface WorkflowItem {
    id: number | string;
    name: string;
    code: string;
    type?: string;
    definition?: string;
    status: number;
    remark?: string;
    createTime?: string;
  }

  export interface InstanceItem {
    id: number | string;
    workflowId: number;
    workflowName?: string;
    applicantId: number;
    applicantName?: string;
    title: string;
    content?: string;
    currentStep: number;
    totalSteps: number;
    status: string;
    bizType?: string;
    bizId?: string;
    createTime?: string;
    finishTime?: string;
  }

  export interface TaskItem {
    id: number | string;
    instanceId: number;
    step: number;
    approverId: number;
    approverName?: string;
    action: string;
    comment?: string;
    approveTime?: string;
  }
}

/** 分页查询工作流定义 */
export async function getWorkflowListApi(params: {
  page?: number;
  pageSize?: number;
  name?: string;
}) {
  return requestClient.get<{
    items: WorkflowApi.WorkflowItem[];
    total: number;
  }>('/system/workflow/list', { params });
}

/** 新增工作流定义 */
export async function createWorkflowApi(data: Partial<WorkflowApi.WorkflowItem>) {
  return requestClient.post<number>('/system/workflow', data);
}

/** 编辑工作流定义 */
export async function updateWorkflowApi(
  id: number | string,
  data: Partial<WorkflowApi.WorkflowItem>,
) {
  return requestClient.put(`/system/workflow/${id}`, data);
}

/** 删除工作流定义 */
export async function deleteWorkflowApi(id: number | string) {
  return requestClient.delete(`/system/workflow/${id}`);
}

/** 发起审批 */
export async function startWorkflowApi(data: {
  workflowId: number;
  title: string;
  content?: string;
  bizType?: string;
  bizId?: string;
}) {
  return requestClient.post<number>('/system/workflow/start', null, {
    params: data,
  });
}

/** 审批操作 */
export async function approveWorkflowApi(
  instanceId: number | string,
  action: string,
  comment?: string,
) {
  return requestClient.put(`/system/workflow/${instanceId}/approve`, null, {
    params: { action, comment },
  });
}

/** 撤回申请 */
export async function cancelWorkflowApi(instanceId: number | string) {
  return requestClient.put(`/system/workflow/${instanceId}/cancel`);
}

/** 我的审批列表 */
export async function getWorkflowInstancesApi(params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return requestClient.get<{
    items: WorkflowApi.InstanceItem[];
    total: number;
  }>('/system/workflow/instances', { params });
}

/** 审批记录 */
export async function getWorkflowTasksApi(instanceId: number | string) {
  return requestClient.get<WorkflowApi.TaskItem[]>(
    `/system/workflow/${instanceId}/tasks`,
  );
}
