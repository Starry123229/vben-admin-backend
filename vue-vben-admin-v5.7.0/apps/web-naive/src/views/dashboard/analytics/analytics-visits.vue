<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  trendData?: { month: string; count: number }[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderChart();
});

watch(
  () => props.trendData,
  () => renderChart(),
  { deep: true },
);

function renderChart() {
  const data = props.trendData || [];
  const months = data.map((d) => d.month);
  const counts = data.map((d) => d.count);

  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    series: [
      {
        barMaxWidth: 80,
        data: counts,
        type: 'bar',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      data: months.length > 0 ? months : ['暂无数据'],
      type: 'category',
    },
    yAxis: {
      splitNumber: 4,
      type: 'value',
    },
  });
}
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
