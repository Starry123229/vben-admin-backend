import { requestClient } from '#/api/request';

async function getOnlineList(username?: string) {
  const params: Record<string, any> = {};
  if (username) params.username = username;
  return requestClient.get<any[]>('/system/online/list', { params });
}
async function forceLogout(token: string) {
  return requestClient.delete(`/system/online/${token}`);
}

export { forceLogout, getOnlineList };
