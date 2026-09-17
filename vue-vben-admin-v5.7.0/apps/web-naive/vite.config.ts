import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // Node.js 后端（NestJS, 全局前缀 /api）
            target: 'http://localhost:3000/api',
            ws: true,
          },
        },
      },
    },
  };
});
