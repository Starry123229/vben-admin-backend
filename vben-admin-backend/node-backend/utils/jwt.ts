import type { EventHandlerRequest, H3Event } from 'h3';

import { getHeader } from 'h3';
import jwt from 'jsonwebtoken';

/**
 * 访问令牌（accessToken）工具
 * 有效期 7 天，登录后置于响应体，前端每次请求放 Authorization: Bearer 头
 * 注：刷新令牌不走 JWT，采用不透明随机串 + 库存哈希（见 utils/refresh-token.ts），可随时吊销
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

type PayloadInput = Omit<TokenPayload, 'exp' | 'iat'>;

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? 'access_token_secret';

/** 签发访问令牌 */
export function generateAccessToken(payload: PayloadInput) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
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
