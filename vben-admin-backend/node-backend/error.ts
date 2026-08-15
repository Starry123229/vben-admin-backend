import type { NitroErrorHandler } from 'nitropack';

/**
 * 全局兜底错误处理器
 * 未被接口捕获的异常统一走这里：返回契约信封格式，不暴露堆栈细节
 */
const errorHandler: NitroErrorHandler = function (error, event) {
  event.node.res.statusCode = 500;
  event.node.res.setHeader('Content-Type', 'application/json');
  event.node.res.end(
    JSON.stringify({
      code: -1,
      data: null,
      error: error.message,
      message: 'Internal Server Error',
    }),
  );
};

export default errorHandler;
