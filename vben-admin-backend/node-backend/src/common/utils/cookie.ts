import type { Response } from 'express';

/**
 * Cookie 工具（对标 Java 端 issueRefreshToken / clearRefreshCookie）
 * refresh Cookie 名固定为 "jwt"，HttpOnly
 */
export const REFRESH_COOKIE = 'jwt';

export function setRefreshCookie(
  reply: Response,
  token: string,
): void {
  const maxAge = Number(process.env.REFRESH_TOKEN_DAYS || 7) * 24 * 3600;
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite = process.env.COOKIE_SAME_SITE || 'Lax';

  reply.header(
    'Set-Cookie',
    `${REFRESH_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure ? '; Secure' : ''}`,
  );
}

export function clearRefreshCookie(reply: Response): void {
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite = process.env.COOKIE_SAME_SITE || 'Lax';

  reply.header(
    'Set-Cookie',
    `${REFRESH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=${sameSite}${secure ? '; Secure' : ''}`,
  );
}

/** 从 Cookie 头解析 refresh token */
export function readRefreshCookie(request: any): string | null {
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c: string) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (name === REFRESH_COOKIE) {
      return valueParts.join('=');
    }
  }
  return null;
}
