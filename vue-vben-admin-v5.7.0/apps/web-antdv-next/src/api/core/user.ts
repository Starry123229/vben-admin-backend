import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

/**
 * 更新当前用户基本资料（姓名/个人简介）
 */
export async function updateProfileApi(data: { intro?: string; realName?: string }) {
  return requestClient.put<void>('/user/profile', data);
}
