<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { markRaw, onMounted, ref } from 'vue';

import {
  getBrowserDistributionApi,
  getDeptDistributionApi,
  getOverviewApi,
  getRoleDistributionApi,
  getUserTrendsApi,
} from '#/api/system/dashboard';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems = ref<AnalysisOverviewItem[]>([
  {
    icon: markRaw(SvgCardIcon),
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 0,
    value: 0,
  },
  {
    icon: markRaw(SvgCakeIcon),
    title: '角色数',
    totalTitle: '总角色数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: markRaw(SvgDownloadIcon),
    title: '部门数',
    totalTitle: '总部门数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: markRaw(SvgBellIcon),
    title: '菜单数',
    totalTitle: '总菜单数',
    totalValue: 0,
    value: 0,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];

// 用户增长趋势数据
const trendData = ref<{ month: string; count: number }[]>([]);
// 角色分布数据
const roleData = ref<{ name: string; value: number }[]>([]);
// 部门分布数据
const deptData = ref<{ name: string; value: number }[]>([]);
// 浏览器分布数据
const browserData = ref<{ name: string; value: number }[]>([]);

onMounted(async () => {
  try {
    const [overview, trends, roles, depts, browsers] = await Promise.all([
      getOverviewApi(),
      getUserTrendsApi(),
      getRoleDistributionApi(),
      getDeptDistributionApi(),
      getBrowserDistributionApi(),
    ]);

    overviewItems.value = [
      {
        icon: markRaw(SvgCardIcon),
        title: '用户量',
        totalTitle: '总用户量',
        totalValue: Number(overview.totalUsers) || 0,
        value: Number(overview.activeUsers) || 0,
      },
      {
        icon: markRaw(SvgCakeIcon),
        title: '角色数',
        totalTitle: '总角色数',
        totalValue: Number(overview.totalRoles) || 0,
        value: Number(overview.totalRoles) || 0,
      },
      {
        icon: markRaw(SvgDownloadIcon),
        title: '部门数',
        totalTitle: '总部门数',
        totalValue: Number(overview.totalDepts) || 0,
        value: Number(overview.totalDepts) || 0,
      },
      {
        icon: markRaw(SvgBellIcon),
        title: '菜单数',
        totalTitle: '总菜单数',
        totalValue: Number(overview.totalMenus) || 0,
        value: Number(overview.totalMenus) || 0,
      },
    ];

    trendData.value = trends.map((item) => ({
      month: item.month,
      count: Number(item.count) || 0,
    }));
    roleData.value = roles.map((item) => ({
      name: item.name,
      value: Number(item.value) || 0,
    }));
    deptData.value = depts.map((item) => ({
      name: item.name,
      value: Number(item.value) || 0,
    }));
    browserData.value = browsers.map((item) => ({
      name: item.name,
      value: Number(item.value) || 0,
    }));
  } catch (error) {
    console.error('加载仪表盘数据失败:', error);
  }
});
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends :trend-data="trendData" />
      </template>
      <template #visits>
        <AnalyticsVisits :trend-data="trendData" />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
        title="角色分布"
      >
        <AnalyticsVisitsData :role-data="roleData" />
      </AnalysisChartCard>
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
        title="部门分布"
      >
        <AnalyticsVisitsSource :dept-data="deptData" />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="浏览器分布">
        <AnalyticsVisitsSales :browser-data="browserData" />
      </AnalysisChartCard>
    </div>
  </div>
</template>
