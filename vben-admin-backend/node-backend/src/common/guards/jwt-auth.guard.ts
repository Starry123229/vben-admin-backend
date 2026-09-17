import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ServiceException } from '../result.js';

/**
 * JWT 鉴权 Guard（对标 Java 端 SaInterceptor）
 * 从 Authorization: Bearer 头提取 token → 校验 → 挂载 request.user
 * 同时检查用户是否被禁用（与 Java 端 SaTokenConfig 实时校验一致）
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ServiceException.unauthorized();
    }

    const token = authHeader.slice(7);
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw ServiceException.unauthorized();
    }

    // 按 userId 回查用户（等价于 token 里只信任 userId，其余以库为准）
    const user = await this.prisma.sysUser.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!user || user.status === 0) {
      throw ServiceException.forbidden('该账号已被禁用，请联系管理员');
    }

    request.user = {
      id: user.id.toString(),
      username: user.username,
      realName: user.realName,
      homePath: user.homePath,
    };

    return true;
  }
}
