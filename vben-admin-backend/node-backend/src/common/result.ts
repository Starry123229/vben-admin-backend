// FastifyReply 类型从 fastify 包导入，在此仅用于类型参考

/**
 * 统一响应包裹体：{ code, data, error, message }
 * code = 0 成功 / -1 失败（与 Java 端 R.java 完全一致）
 */
export class R {
  static ok<T>(data: T = null): { code: number; data: T; error: null; message: string } {
    return { code: 0, data, error: null, message: 'ok' };
  }

  static fail(message: string): { code: number; data: null; error: string; message: string } {
    return { code: -1, data: null, error: message, message };
  }
}

/**
 * 分页结果包裹：{ items, total }（与 Java 端 PageResult.java 一致）
 */
export class PageResult<T> {
  constructor(
    public items: T[],
    public total: number,
  ) {}
}

/**
 * 业务异常（对标 Java 端 ServiceException）
 * 携带 HTTP 状态码，由全局异常过滤器转为「非 2xx + code:-1 包裹体」
 */
export class ServiceException extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceException';
  }

  static badRequest(message: string): ServiceException {
    return new ServiceException(400, message);
  }

  static unauthorized(): ServiceException {
    return new ServiceException(401, 'Unauthorized Exception');
  }

  static forbidden(message = 'Forbidden Exception'): ServiceException {
    return new ServiceException(403, message);
  }

  static notFound(message = 'Not Found'): ServiceException {
    return new ServiceException(404, message);
  }
}
