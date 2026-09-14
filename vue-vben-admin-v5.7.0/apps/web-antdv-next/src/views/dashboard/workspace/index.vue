<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { getOverviewApi } from '#/api/system/dashboard';
import { getNoticeListApi } from '#/api/system/notice';

defineOptions({ name: 'Workspace' });

const router = useRouter();
const userStore = useUserStore();

const overview = ref({
  totalUsers: 0,
  activeUsers: 0,
  disabledUsers: 0,
  totalRoles: 0,
  totalDepts: 0,
  totalMenus: 0,
});

const recentNotices = ref<any[]>([]);

const shortcuts = computed(() => [
  { icon: 'lucide:user', title: $t('page.system.user'), path: '/system/user', color: '#4f6ef7' },
  { icon: 'lucide:shield-check', title: $t('page.system.role'), path: '/system/role', color: '#10b981' },
  { icon: 'lucide:building-2', title: $t('page.system.dept'), path: '/system/dept', color: '#f59e0b' },
  { icon: 'lucide:menu', title: $t('page.system.menu'), path: '/system/menu', color: '#8b5cf6' },
  { icon: 'lucide:bell', title: $t('page.system.notice'), path: '/system/tools/notice', color: '#ef4444' },
  { icon: 'lucide:bar-chart-3', title: $t('page.dashboard.dataAnalysis'), path: '/analytics', color: '#06b6d4' },
]);

const statItems = computed(() => [
  { label: $t('page.dashboard.totalUsers'), value: overview.value.totalUsers, color: '#4f6ef7' },
  { label: $t('page.dashboard.activeUsers'), value: overview.value.activeUsers, color: '#10b981' },
  { label: $t('page.dashboard.totalRoles'), value: overview.value.totalRoles, color: '#f59e0b' },
  { label: $t('page.dashboard.totalDepts'), value: overview.value.totalDepts, color: '#8b5cf6' },
]);

const todoItems = computed(() => [
  { title: $t('page.dashboard.todo1'), desc: $t('page.dashboard.todo1Desc'), done: false, priority: $t('page.dashboard.priorityHigh') },
  { title: $t('page.dashboard.todo2'), desc: $t('page.dashboard.todo2Desc'), done: false, priority: $t('page.dashboard.priorityMedium') },
  { title: $t('page.dashboard.todo3'), desc: $t('page.dashboard.todo3Desc'), done: false, priority: $t('page.dashboard.priorityLow') },
  { title: $t('page.dashboard.todo4'), desc: $t('page.dashboard.todo4Desc'), done: true, priority: $t('page.dashboard.priorityMedium') },
]);

const noticeColorMap: Record<string, string> = {
  info: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

onMounted(async () => {
  try {
    const [data, notices] = await Promise.all([
      getOverviewApi(),
      getNoticeListApi(),
    ]);
    overview.value = data;
    recentNotices.value = notices.slice(0, 5);
  } catch {
    // 错误提示由请求拦截器统一处理
  }
});

function goTo(path: string) {
  router.push(path);
}
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4 p-4">
      <!-- 欢迎卡片 -->
      <div class="flex items-center justify-between rounded-lg border bg-card p-6">
        <div>
          <h1 class="text-2xl font-semibold">
            {{ $t('page.dashboard.welcome') }}，{{
              userStore.userInfo?.realName ||
              userStore.userInfo?.username ||
              $t('page.dashboard.welcome')
            }}
          </h1>
          <p class="text-foreground/70 mt-2">
            {{ $t('page.dashboard.welcomeDesc') }}
          </p>
        </div>
        <div class="hidden h-20 w-20 items-center justify-center rounded-full bg-primary/10 md:flex">
          <IconifyIcon icon="lucide:hand" class="size-10 text-primary" />
        </div>
      </div>

      <!-- 统计概览 -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="(item, idx) in statItems"
          :key="idx"
          class="rounded-lg border bg-card p-4"
        >
          <p class="text-foreground/60 text-sm">{{ item.label }}</p>
          <p class="mt-1 text-3xl font-bold" :style="{ color: item.color }">
            {{ item.value }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- 快捷入口 -->
        <div class="rounded-lg border bg-card p-4">
          <h3 class="mb-3 font-semibold">{{ $t('page.dashboard.shortcuts') }}</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              v-for="item in shortcuts"
              :key="item.path"
              class="flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md"
              @click="goTo(item.path)"
            >
              <div
                class="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: item.color + '15' }"
              >
                <IconifyIcon :icon="item.icon" :style="{ color: item.color }" class="size-6" />
              </div>
              <span class="text-sm font-medium">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <!-- 待办事项 -->
        <div class="rounded-lg border bg-card p-4">
          <h3 class="mb-3 font-semibold">{{ $t('page.dashboard.todos') }}</h3>
          <div class="space-y-2">
            <div
              v-for="(item, idx) in todoItems"
              :key="idx"
              class="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                  :style="{
                    backgroundColor:
                      item.priority === $t('page.dashboard.priorityHigh') ? '#fef2f2'
                      : item.priority === $t('page.dashboard.priorityMedium') ? '#fffbeb'
                      : '#eff6ff',
                    color:
                      item.priority === $t('page.dashboard.priorityHigh') ? '#ef4444'
                      : item.priority === $t('page.dashboard.priorityMedium') ? '#f59e0b'
                      : '#3b82f6',
                  }"
                >
                  {{ item.priority }}
                </span>
                <span :class="{ 'text-foreground/50 line-through': item.done }">
                  {{ item.title }}
                </span>
                <span class="text-foreground/50 text-xs ml-1">
                  {{ item.desc }}
                </span>
              </div>
              <span
                v-if="item.done"
                class="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-xs text-green-600"
              >
                {{ $t('page.dashboard.done') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近通知 -->
      <div class="rounded-lg border bg-card p-4">
        <h3 class="mb-3 font-semibold">{{ $t('page.dashboard.recentNotices') }}</h3>
        <div v-if="recentNotices.length > 0" class="space-y-3">
          <div
            v-for="notice in recentNotices"
            :key="notice.id"
            class="flex gap-3 border-b pb-3 last:border-0"
          >
            <div
              class="mt-1 h-3 w-3 shrink-0 rounded-full"
              :style="{
                backgroundColor: noticeColorMap[notice.type] || '#3b82f6',
              }"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                  :style="{
                    backgroundColor: (noticeColorMap[notice.type] || '#3b82f6') + '15',
                    color: noticeColorMap[notice.type] || '#3b82f6',
                  }"
                >
                  {{ notice.type || 'info' }}
                </span>
                <span class="font-medium">{{ notice.title }}</span>
                <span
                  v-if="!notice.isRead"
                  class="text-xs text-red-500"
                >
                  {{ $t('page.dashboard.unread') }}
                </span>
              </div>
              <p class="text-foreground/70 text-sm mt-1">
                {{ notice.message }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center text-foreground/50">
          {{ $t('page.dashboard.noNotices') }}
        </div>
      </div>
    </div>
  </Page>
</template>
