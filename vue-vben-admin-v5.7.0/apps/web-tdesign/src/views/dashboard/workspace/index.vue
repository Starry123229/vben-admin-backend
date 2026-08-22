<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { getWorkspaceApi } from '#/api/system/dashboard';
import { getNoticeListApi } from '#/api/system/notice';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();
const router = useRouter();

// 从后端加载工作台统计数据
const workspaceStats = ref({
  totalUsers: 0,
  totalRoles: 0,
  totalDepts: 0,
  totalMenus: 0,
});

// 部门分布数据（用于访问来源图表）
const deptData = ref<{ name: string; value: number }[]>([]);

// 快捷导航
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '仪表盘',
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:people-outline',
    title: '用户管理',
    url: '/system/user',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: '系统管理',
    url: '/system/role',
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: '菜单管理',
    url: '/system/menu',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '分析页',
    url: '/analytics',
  },
];

// 项目卡片 - 使用后端统计数据
const projectItems = ref<WorkbenchProjectItem[]>([]);

// 待办事项 - 从通知消息获取
const todoItems = ref<WorkbenchTodoItem[]>([]);

// 最新动态 - 从通知消息获取
const trendItems = ref<WorkbenchTrendItem[]>([]);

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

onMounted(async () => {
  try {
    const data = await getWorkspaceApi();
    workspaceStats.value = data;

    // 使用统计数据构建项目卡片
    projectItems.value = [
      {
        color: '#5ab1ef',
        content: `系统共有 ${data.totalUsers} 位用户`,
        date: new Date().toLocaleDateString(),
        group: '系统',
        icon: 'ion:people-outline',
        title: '用户管理',
        url: '/system/user',
      },
      {
        color: '#3fb27f',
        content: `系统共有 ${data.totalRoles} 个角色`,
        date: new Date().toLocaleDateString(),
        group: '权限',
        icon: 'ion:key-outline',
        title: '角色管理',
        url: '/system/role',
      },
      {
        color: '#e18525',
        content: `系统共有 ${data.totalDepts} 个部门`,
        date: new Date().toLocaleDateString(),
        group: '组织',
        icon: 'ion:business-outline',
        title: '部门管理',
        url: '/system/dept',
      },
      {
        color: '#bf0c2c',
        content: `系统共有 ${data.totalMenus} 个菜单`,
        date: new Date().toLocaleDateString(),
        group: '导航',
        icon: 'ion:menu-outline',
        title: '菜单管理',
        url: '/system/menu',
      },
    ];
  } catch (error) {
    console.error('加载工作台数据失败:', error);
  }

  // 加载通知消息作为待办和动态
  try {
    const notices = await getNoticeListApi();
    // 未读通知 → 待办事项
    todoItems.value = notices
      .filter((n) => !n.isRead)
      .map((n) => ({
        completed: false,
        content: n.message,
        date: n.date,
        title: n.title,
      }));
    // 所有通知 → 最新动态
    trendItems.value = notices.map((n) => ({
      avatar: n.avatar || 'svg:avatar-1',
      content: n.message,
      date: n.date,
      title: n.title,
    }));
  } catch (error) {
    console.error('加载通知数据失败:', error);
  }
});
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！
      </template>
      <template #description>
        当前系统：用户 {{ workspaceStats.totalUsers }} 人，角色
        {{ workspaceStats.totalRoles }} 个，部门
        {{ workspaceStats.totalDepts }} 个，菜单
        {{ workspaceStats.totalMenus }} 个
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo" />
        <WorkbenchTrends :items="trendItems" class="mt-5" title="最新动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" />
        <AnalysisChartCard class="mt-5" title="部门分布">
          <AnalyticsVisitsSource :dept-data="deptData" />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>
