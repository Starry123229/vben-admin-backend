@echo off
rem 一键启动前端（web-antd）。后端请先运行 vben-admin-backend\java-backend（mvn spring-boot:run）
cd /d %~dp0vue-vben-admin-v5.7.0
pnpm dev:antd