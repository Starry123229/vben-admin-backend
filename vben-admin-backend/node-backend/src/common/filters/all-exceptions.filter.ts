import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { R, ServiceException } from '../result';

/**
 * 全局异常过滤器（对标 Java 端 GlobalExceptionHandler）
 * 统一转为「HTTP 状态码 + code:-1 包裹体」，禁止堆栈出站。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let logged = false;

    if (exception instanceof ServiceException) {
      // 业务异常：按携带的状态码返回
      status = exception.status;
      message = exception.message;
    } else if (exception instanceof Error) {
      // 参数校验等
      const errName = exception.constructor.name;
      if (exception['response']) {
        // class-validator 的 ValidationException
        status = HttpStatus.BAD_REQUEST;
        const resp = exception['response'];
        message = typeof resp === 'string' ? resp : (resp.message?.[0] || '参数校验失败');
      } else if (errName === 'SyntaxError') {
        status = HttpStatus.BAD_REQUEST;
        message = '请求体格式错误';
      } else {
        this.logger.error(
          `未捕获异常: ${exception.message}`,
          exception.stack,
        );
        logged = true;
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '服务器内部错误';
      }
    }

    if (!logged && status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${message}`,
      );
    }

    response.status(status).json(R.fail(message));
  }
}
