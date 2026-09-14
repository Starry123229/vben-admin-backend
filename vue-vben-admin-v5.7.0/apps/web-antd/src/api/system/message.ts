import { requestClient } from '#/api/request';

export namespace MessageApi {
  export interface MessageItem {
    id: number | string;
    userId: number;
    senderId: number;
    title: string;
    content?: string;
    type?: string;
    isRead: number;
    createTime?: string;
  }

  export interface UnreadCount {
    unread: number;
  }
}

/** 分页查询当前用户消息列表 */
export async function getMessageListApi(params: {
  page?: number;
  pageSize?: number;
  isRead?: number;
}) {
  return requestClient.get<{
    items: MessageApi.MessageItem[];
    total: number;
  }>('/system/message/list', { params });
}

/** 获取未读消息数量 */
export async function getUnreadCountApi() {
  return requestClient.get<MessageApi.UnreadCount>(
    '/system/message/unread-count',
  );
}

/** 标记单条消息为已读 */
export async function markMessageReadApi(id: number | string) {
  return requestClient.put(`/system/message/${id}/read`);
}

/** 全部标记已读 */
export async function markAllMessageReadApi() {
  return requestClient.put('/system/message/read-all');
}

/** 发送站内信（管理员） */
export async function sendMessageApi(data: {
  userId: number;
  title: string;
  content: string;
  type?: string;
  email?: string;
}) {
  return requestClient.post<void>('/system/message/send', null, {
    params: data,
  });
}
