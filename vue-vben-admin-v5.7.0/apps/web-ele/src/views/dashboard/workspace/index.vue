<script setup lang="ts">
import { useUserStore } from '@vben/stores';

import { ElCard as Card } from 'element-plus';

defineOptions({ name: 'Workspace' });

const userStore = useUserStore();
</script>

<template>
  <div class="p-5">
    <Card>
      <div class="p-6">
        <h1 class="text-2xl font-semibold">
          欢迎回来，{{ userStore.userInfo?.realName || userStore.userInfo?.username || '用户' }}
        </h1>
        <p class="text-foreground/70 mt-2">
          这是您的工作台，可以从左侧菜单进入各功能模块。
        </p>
      </div>
    </Card>
  </div>
</template>
