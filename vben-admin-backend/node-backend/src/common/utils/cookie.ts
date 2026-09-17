import type { FastifyReply, FastifyRequest } from 'fastify';
import '@fastify/cookie';

/**
 * Cookie 工具（对标 Java 端 issueRefreshToken / clearRefreshCookie）
 * refresh Cookie 名固定为 "jwt"，HttpOnly
 * 使用 @fastify/cookie 插件提供的 setCookie/clearCookie 方法
 */
export const REFRESH_COOKIE = 'jwt';

export function setRefreshCookie(reply: FastifyReply, token: string): void {
  const maxAge = Number(process.env.REFRESH_TOKEN_DAYS || 7) * 24 * 3600;
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite = (process.env.COOKIE_SAME_SITE || 'Lax') as 'Lax' | 'None' | 'Strict';

  (reply as any).setCookie(REFRESH_COOKIE, token, {
    path: '/',
    maxAge,
    httpOnly: true,
    sameSite,
    secure,
  });
}

export function clearRefreshCookie(reply: FastifyReply): void {
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite = (process.env.COOKIE_SAME_SITE || 'Lax') as 'Lax' | 'None' | 'Strict';

  (reply as any).clearCookie(REFRESH_COOKIE, {
    path: '/',
    httpOnly: true,
    sameSite,
    secure,
  });
}

/** 从 Cookie 头解析 refresh token */
export function readRefreshCookie(request: FastifyRequest): string | null {
  // 优先使用 @fastify/cookie 插件解析的 cookies 对象
  const cookies = (request as any).cookies;
  if (cookies && cookies[REFRESH_COOKIE]) {
    return cookies[REFRESH_COOKIE];
  }

  // 降级：手动解析 Cookie 头
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return null;

  const cookiesArr = cookieHeader.split(';').map((c: string) => c.trim());
  for (const cookie of cookiesArr) {
    const [name, ...valueParts] = cookie.split('=');
    if (name === REFRESH_COOKIE) {
      return valueParts.join('=');
    }
  }
  return null;
}
