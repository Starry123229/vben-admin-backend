import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

/**
 * JWT 工具（对标 Java 端 AuthService 中的 token 管理）
 */

/** 签发 accessToken（对标 Sa-Token 的 StpUtil.login + getTokenValue） */
export function signAccessToken(userId: string | bigint): string {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_ACCESS_SECRET as jwt.Secret,
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES || '2h') as any },
  );
}

/** 校验 accessToken，返回 payload */
export function verifyAccessToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET) as { userId: string };
}

/** 生成随机 refreshToken（对标 Java 端 SecureRandom + HexFormat） */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 哈希（对标 Java 端 sha256 方法） */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
