import { requestClient } from '#/api/request';

export namespace NoticeApi {
  export interface NoticeItem {
    id: number | string;
    title: string;
    message?: string;
    avatar?: string;
    link?: string;
    isRead: boolean;
    type?: string;
    date?: string;
    query?: Record<string, any>;
    state?: Record<string, any>;
  }
}

/** 获取当前用户通知列表 */
export async function getNoticeListApi() {
  return requestClient.get<NoticeApi.NoticeItem[]>('/system/notice/list');
}

/** 标记单条通知为已读 */
export async function markNoticeReadApi(id: number | string) {
  return requestClient.put(`/system/notice/${id}/read`);
}

/** 全部标记已读 */
export async function markAllNoticeReadApi() {
  return requestClient.put('/system/notice/read-all');
}

/** 删除单条通知 */
export async function deleteNoticeApi(id: number | string) {
  return requestClient.delete(`/system/notice/${id}`);
}

/** 清空所有通知 */
export async function clearNoticeApi() {
  return requestClient.delete('/system/notice/clear');
}

/** 发送通知给指定用户（仅 super/admin） */
export async function sendNoticeToUserApi(data: {
  avatar?: string;
  link?: string;
  message?: string;
  title: string;
  type?: string;
  userId: number;
}) {
  return requestClient.post<void>('/system/notice/send', data);
}

/** 按角色广播通知（仅 super/admin），返回发送人数 */
export async function broadcastNoticeToRoleApi(data: {
  avatar?: string;
  link?: string;
  message?: string;
  roleId: number;
  title: string;
  type?: string;
}) {
  return requestClient.post<number>('/system/notice/broadcast', data);
}
