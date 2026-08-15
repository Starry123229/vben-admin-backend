import type { EventHandlerRequest, H3Event } from 'h3';

import { deleteCookie, getCookie, setCookie } from 'h3';

/**
 * 刷新令牌 Cookie 工具
 * 契约细节（与官方 mock 严格一致，前端无感依赖这些属性）：
 * - Cookie 名固定为 jwt
 * - HttpOnly：JS 不可读，防 XSS 窃取
 * - sameSite=none + secure：允许跨站携带（需 HTTPS；本地 localhost 有豁免）
 * - maxAge 24 小时：Cookie 本体寿命，短于令牌 30 天有效期
 */

const REFRESH_COOKIE = 'jwt';

/** 写入刷新令牌 Cookie */
export function setRefreshTokenCookie(
  event: H3Event<EventHandlerRequest>,
  refreshToken: string,
) {
  setCookie(event, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60,
    sameSite: 'none',
    secure: true,
  });
}

/** 读取刷新令牌 Cookie */
export function getRefreshTokenFromCookie(
  event: H3Event<EventHandlerRequest>,
) {
  return getCookie(event, REFRESH_COOKIE);
}

/** 清除刷新令牌 Cookie（登出 / 刷新失败时） */
export function clearRefreshTokenCookie(event: H3Event<EventHandlerRequest>) {
  deleteCookie(event, REFRESH_COOKIE, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
}
