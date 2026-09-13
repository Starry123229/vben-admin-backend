# vue-vben-admin-v5.7.0

多 UI 框架的后台管理前端模板，已裁剪为**纯净开发模板**：

- 5 套 UI 框架应用，按需选用其一开发即可：

  | 应用 | UI 框架 | 启动命令 |
  | --- | --- | --- |
  | `apps/web-antd` | Ant Design Vue | `pnpm dev:antd` |
  | `apps/web-antdv-next` | Ant Design Vue (next) | `pnpm dev:antdv-next` |
  | `apps/web-ele` | Element Plus | `pnpm dev:ele` |
  | `apps/web-naive` | Naive UI | `pnpm dev:naive` |

- 已移除全部官方演示页面（demos / workspace / about）
- 已对接自建后端（见仓库根目录 `vben-admin-backend/`），接口前缀 `/api`，开发环境代理到 `http://localhost:8080/api`
- 演示账号：`vben / 123456`（super）、`admin / 123456`、`jack / 123456`

## 开发

```bash
pnpm install
pnpm dev:antd   # 任选一套 UI
```