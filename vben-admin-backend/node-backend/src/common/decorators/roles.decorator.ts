import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles('super', 'admin') 装饰器
 * 对标 Java 端 @SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
