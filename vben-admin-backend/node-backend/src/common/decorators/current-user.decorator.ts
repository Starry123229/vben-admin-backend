import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() 装饰器：从 request.user 中提取当前登录用户信息
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
