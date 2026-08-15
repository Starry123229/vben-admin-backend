import type { EventHandlerRequest, H3Event } from 'h3';

import { getHeader } from 'h3';
import jwt from 'jsonwebtoken';

/**
 * JWT 令牌工具（双令牌机制）
 * - accessToken：有效期 7 天，登录后置于响应体，前端每次请求放 Authorization: Bearer 头
 * - refreshToken：有效期 30 天，置于 HttpOnly Cookie，仅 /auth/refresh 使用
 */

/** 令牌载荷：与用户表核心字段对齐 */
export interface TokenPayload {
  homePath?: string;
  id: number;
  realName: string;
  roles: string[];
  username: string;
  iat: number;
  exp: number;
}

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? 'access_token_secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? 'refresh_token_secret';

type PayloadInput = Omit<TokenPayload, 'exp' | 'iat'>;

/** 签发访问令牌 */
export function generateAccessToken(payload: PayloadInput) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

/** 签发刷新令牌 */
export function generateRefreshToken(payload: PayloadInput) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

/**
 * 从请求头解析并校验访问令牌
 * @returns 校验失败返回 null（接口据此回 401）
 */
export function verifyAccessToken(
  event: H3Event<EventHandlerRequest>,
): null | Omit<TokenPayload, 'exp' | 'iat'> {
  const authHeader = getHeader(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer')) {
    return null;
  }
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2) {
    return null;
  }
  try {
    const decoded = jwt.verify(
      tokenParts[1] as string,
      ACCESS_TOKEN_SECRET,
    ) as TokenPayload;
    const { exp: _exp, iat: _iat, ...userinfo } = decoded;
    return userinfo;
  } catch {
    return null;
  }
}

/** 校验刷新令牌（从 Cookie 中取出后调用） */
export function verifyRefreshToken(
  token: string,
): null | Omit<TokenPayload, 'exp' | 'iat'> {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    const { exp: _exp, iat: _iat, ...userinfo } = decoded;
    return userinfo;
  } catch {
    return null;
  }
}
