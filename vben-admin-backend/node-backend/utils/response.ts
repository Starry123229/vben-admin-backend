import type { EventHandlerRequest, H3Event } from 'h3';

import { setResponseStatus } from 'h3';

/**
 * 统一响应信封：前端 requestClient 依赖 code===0 判定成功
 * 契约：{ code, data, error, message }
 */

/** 成功响应 */
export function useResponseSuccess<T = any>(data: T) {
  return {
    code: 0,
    data,
    error: null,
    message: 'ok',
  };
}

/** 分页成功响应：data 固定为 { items, total } 结构 */
export function usePageResponseSuccess<T = any>(
  page: number | string,
  pageSize: number | string,
  list: T[],
  { message = 'ok' } = {},
) {
  const pageData = pagination(
    Number.parseInt(`${page}`),
    Number.parseInt(`${pageSize}`),
    list,
  );

  return {
    ...useResponseSuccess({
      items: pageData,
      total: list.length,
    }),
    message,
  };
}

/** 失败响应（HTTP 状态码保持 200，由 code 表达错误） */
export function useResponseError(message: string, error: any = null) {
  return {
    code: -1,
    data: null,
    error,
    message,
  };
}

/** 403 禁止访问：同步设置 HTTP 状态码，前端拦截器依赖它 */
export function forbiddenResponse(
  event: H3Event<EventHandlerRequest>,
  message = 'Forbidden Exception',
) {
  setResponseStatus(event, 403);
  return useResponseError(message, message);
}

/** 401 未授权：token 缺失/失效，前端据此触发刷新或重新登录 */
export function unAuthorizedResponse(event: H3Event<EventHandlerRequest>) {
  setResponseStatus(event, 401);
  return useResponseError('Unauthorized Exception', 'Unauthorized Exception');
}

/** 内存分页工具（数据量小的演示接口使用；大表走 SQL 分页） */
export function pagination<T = any>(
  pageNo: number,
  pageSize: number,
  array: T[],
): T[] {
  const offset = (pageNo - 1) * Number(pageSize);
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset)
    : array.slice(offset, offset + Number(pageSize));
}
