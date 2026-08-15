import errorHandler from './error';

process.env.COMPATIBILITY_DATE = new Date().toISOString();

export default defineNitroConfig({
  // 全局错误处理：统一 JSON 信封输出，避免泄露堆栈
  devErrorHandler: errorHandler,
  errorHandler: '~/error',
  routeRules: {
    // /api/** 开启跨域并允许携带凭证（refreshToken Cookie 依赖）
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'Accept, Authorization, Content-Length, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-CSRF-TOKEN, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': '*',
      },
    },
  },
});
