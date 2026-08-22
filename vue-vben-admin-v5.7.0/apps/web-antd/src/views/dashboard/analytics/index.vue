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

import { onMounted, ref } from 'vue';

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

const overviewItems = ref<AnalysisOverviewItem[]>([
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '角色数',
    totalTitle: '总角色数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgDownloadIcon,
    title: '部门数',
    totalTitle: '总部门数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgBellIcon,
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

onMounted(async () => {
  try {
    const [overview, trends, roles, depts] = await Promise.all([
      getOverviewApi(),
      getUserTrendsApi(),
      getRoleDistributionApi(),
      getDeptDistributionApi(),
    ]);

    overviewItems.value = [
      {
        icon: SvgCardIcon,
        title: '用户量',
        totalTitle: '总用户量',
        totalValue: overview.totalUsers,
        value: overview.activeUsers,
      },
      {
        icon: SvgCakeIcon,
        title: '访问量',
        totalTitle: '总角色数',
        totalValue: overview.totalRoles,
        value: overview.totalRoles,
      },
      {
        icon: SvgDownloadIcon,
        title: '部门数',
        totalTitle: '总部门数',
        totalValue: overview.totalDepts,
        value: overview.totalDepts,
      },
      {
        icon: SvgBellIcon,
        title: '菜单数',
        totalTitle: '总菜单数',
        totalValue: overview.totalMenus,
        value: overview.totalMenus,
      },
    ];

    trendData.value = trends;
    roleData.value = roles;
    deptData.value = depts;
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
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
