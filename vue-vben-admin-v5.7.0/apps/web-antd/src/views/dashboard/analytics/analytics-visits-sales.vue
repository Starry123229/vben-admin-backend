<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  deptData?: { name: string; value: number }[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderChart();
});

watch(
  () => props.deptData,
  () => renderChart(),
  { deep: true },
);

function renderChart() {
  const data = props.deptData || [];

  renderEcharts({
    series: [
      {
        animationDelay() {
          return Math.random() * 400;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        center: ['50%', '50%'],
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9', '#fa6e86', '#ff9f7f'],
        data: data.length > 0
          ? data.toSorted((a, b) => a.value - b.value)
          : [{ name: '暂无数据', value: 1 }],
        name: '部门占比',
        radius: '80%',
        roseType: 'radius',
        type: 'pie',
      },
    ],

    tooltip: {
      trigger: 'item',
    },
  });
}
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
