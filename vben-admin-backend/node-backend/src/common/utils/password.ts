import * as bcrypt from 'bcryptjs';

/**
 * 密码哈希工具（对标 Java 端 BCryptPasswordEncoder）
 * bcryptjs 与 Spring Security BCrypt 完全兼容
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
