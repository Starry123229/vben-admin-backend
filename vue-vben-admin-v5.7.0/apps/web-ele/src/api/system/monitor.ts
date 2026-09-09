import { requestClient } from '#/api/request';

async function getServerInfo() {
  return requestClient.get<any>('/system/monitor/server');
}

export { getServerInfo };
