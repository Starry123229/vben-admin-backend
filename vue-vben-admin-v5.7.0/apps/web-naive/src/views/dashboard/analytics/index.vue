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

import { computed, markRaw, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
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

// 原始数据（从 API 获取）
const overviewData = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalRoles: 0,
  totalDepts: 0,
  totalMenus: 0,
});

const overviewItems = computed<AnalysisOverviewItem[]>(() => [
  {
    icon: markRaw(SvgCardIcon),
    title: $t('page.dashboard.userCount'),
    totalTitle: $t('page.dashboard.totalUserCount'),
    totalValue: Number(overviewData.value.totalUsers) || 0,
    value: Number(overviewData.value.activeUsers) || 0,
  },
  {
    icon: markRaw(SvgCakeIcon),
    title: $t('page.dashboard.roleCount'),
    totalTitle: $t('page.dashboard.totalRoleCount'),
    totalValue: Number(overviewData.value.totalRoles) || 0,
    value: Number(overviewData.value.totalRoles) || 0,
  },
  {
    icon: markRaw(SvgDownloadIcon),
    title: $t('page.dashboard.deptCount'),
    totalTitle: $t('page.dashboard.totalDeptCount'),
    totalValue: Number(overviewData.value.totalDepts) || 0,
    value: Number(overviewData.value.totalDepts) || 0,
  },
  {
    icon: markRaw(SvgBellIcon),
    title: $t('page.dashboard.menuCount'),
    totalTitle: $t('page.dashboard.totalMenuCount'),
    totalValue: Number(overviewData.value.totalMenus) || 0,
    value: Number(overviewData.value.totalMenus) || 0,
  },
]);

const chartTabs = computed<TabOption[]>(() => [
  {
    label: $t('page.dashboard.trafficTrends'),
    value: 'trends',
  },
  {
    label: $t('page.dashboard.monthlyVisits'),
    value: 'visits',
  },
]);

// 用户增长趋势数据
const trendData = ref<{ month: string; count: number }[]>([]);
// 角色分布数据
const roleData = ref<{ name: string; value: number }[]>([]);
// 部门分布数据
const deptData = ref<{ name: string; value: number }[]>([]);

onMounted(async () => {
  try {
    const [overview, trends, roles, depts] = await Promise.all([
      getOverviewApi(),
      getUserTrendsApi(),
      getRoleDistributionApi(),
      getDeptDistributionApi(),
    ]);

    overviewData.value = overview;

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
  } catch (error) {
    console.error($t('page.dashboard.loadDashboardFailed'), error);
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
        :title="$t('page.dashboard.roleDistribution')"
      >
        <AnalyticsVisitsData :role-data="roleData" />
      </AnalysisChartCard>
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
        :title="$t('page.dashboard.deptDistribution')"
      >
        <AnalyticsVisitsSource :dept-data="deptData" />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" :title="$t('page.dashboard.browserDistribution')">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
