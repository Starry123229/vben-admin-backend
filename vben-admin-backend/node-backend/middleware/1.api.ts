import { defineEventHandler } from 'h3';

/**
 * 全局中间件：跨域支持
 * 1. 回显请求 Origin，配合前端 credentials 携带 Cookie
 * 2. 放行 OPTIONS 预检请求
 * 注：接口鉴权由各接口内部校验 Bearer 令牌（与官方 mock 行为一致）
 */
export default defineEventHandler((event) => {
  event.node.res.setHeader(
    'Access-Control-Allow-Origin',
    event.headers.get('Origin') ?? '*',
  );
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.statusMessage = 'No Content.';
    return 'OK';
  }
});
