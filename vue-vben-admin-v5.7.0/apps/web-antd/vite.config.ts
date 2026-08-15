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
            // 自建 Java 后端（Spring Boot, context-path=/api）
            target: 'http://localhost:8080/api',
            ws: true,
          },
        },
      },
    },
  };
});
