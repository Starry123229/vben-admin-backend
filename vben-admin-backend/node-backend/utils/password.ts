import bcrypt from 'bcryptjs';

/**
 * 密码加密工具
 * cost=10：约 60ms/次，安全性与接口耗时的平衡点
 */

/** 明文密码加密（入库前调用） */
export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

/** 登录校验：比对明文与哈希 */
export function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
