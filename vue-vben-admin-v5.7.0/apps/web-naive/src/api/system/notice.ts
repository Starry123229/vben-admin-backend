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
