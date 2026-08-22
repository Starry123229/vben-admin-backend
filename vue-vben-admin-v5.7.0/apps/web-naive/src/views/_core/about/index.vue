<script lang="ts" setup>
import { About } from '@vben/common-ui';

defineOptions({ name: 'About' });
</script>

<template>
  <About
    author-email="admin@vben-demo.com"
    author-name="Vben Admin Demo"
    author-url="https://github.com/vbenjs/vue-vben-admin"
    description="基于 Vben Admin 框架开发的中后台管理系统，前端采用 Naive UI 组件库，后端使用 Spring Boot + Sa-Token + MyBatis-Plus + MySQL，实现了完整的用户管理、角色管理、菜单管理、部门管理等功能，支持动态路由和权限控制。"
    doc-url="https://doc.vben.pro"
    github-url="https://github.com/vbenjs/vue-vben-admin"
    homepage-url="https://www.vben-demo.com"
    name="Vben Admin Demo (Naive UI)"
    preview-url="https://www.vben-demo.com/preview"
    title="关于项目"
  />
</template>
