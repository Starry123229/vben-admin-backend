import { defineEventHandler } from 'h3';

import { verifyAccessToken } from '~/utils/jwt';
import { getMenuTreeByRoles } from '~/utils/menu-tree';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/**
 * GET /api/menu/all
 * 后端菜单模式数据源：按当前用户角色返回可见菜单树
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const menus = await getMenuTreeByRoles(userinfo.roles);
  return useResponseSuccess(menus);
});
