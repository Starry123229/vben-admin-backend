import { defineEventHandler } from 'h3';

/** 根路由：服务状态页，列出主要接口入口，便于启动后自检 */
export default defineEventHandler(() => {
  return `
<h1>Vben Admin Node Backend</h1>
<h2>Service is running</h2>
<ul>
<li><a href="/api/auth/login">POST /api/auth/login</a></li>
<li><a href="/api/user/info">GET /api/user/info</a></li>
<li><a href="/api/menu/all">GET /api/menu/all</a></li>
<li><a href="/api/auth/codes">GET /api/auth/codes</a></li>
</ul>
`;
});
