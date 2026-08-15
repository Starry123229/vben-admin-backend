import { createHash, randomBytes } from 'node:crypto';

import { and, eq, gt } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysRefreshToken } from '~/db/schema';

/**
 * 刷新令牌（不透明随机串方案）
 * - 令牌本体仅存在于用户 HttpOnly Cookie，数据库只存 SHA-256 哈希（拖库无法重放）
 * - 刷新即轮换：旧令牌删除、签发新令牌（比官方 mock 更安全，前端无感）
 * - 有效期 30 天
 */

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sha256(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/** 签发新刷新令牌：返回明文（给 Cookie），哈希入库 */
export async function issueRefreshToken(userId: number) {
  const token = randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await db
    .insert(sysRefreshToken)
    .values({ expiresAt, tokenHash: sha256(token), userId });
  return token;
}

/**
 * 校验并轮换刷新令牌
 * @returns 无效/过期返回 null；有效则删除旧令牌并返回 { 新令牌, userId }
 */
export async function rotateRefreshToken(
  token: string,
): Promise<{ token: string; userId: number } | null> {
  const [row] = await db
    .select()
    .from(sysRefreshToken)
    .where(
      and(
        eq(sysRefreshToken.tokenHash, sha256(token)),
        gt(sysRefreshToken.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) {
    return null;
  }
  await db.delete(sysRefreshToken).where(eq(sysRefreshToken.id, row.id));
  const newToken = await issueRefreshToken(row.userId);
  return { token: newToken, userId: row.userId };
}

/** 吊销刷新令牌（登出时调用） */
export async function revokeRefreshToken(token: string) {
  await db
    .delete(sysRefreshToken)
    .where(eq(sysRefreshToken.tokenHash, sha256(token)));
}
