import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * @Permissions('AC_100010', 'AC_100020') 装饰器
 * 对标 Java 端 @SaCheckPermission("AC_100010")
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
