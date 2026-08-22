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
    legend: {
      bottom: '2%',
      left: 'center',
    },
    series: [
      {
        animationDelay() {
          return Math.random() * 100;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        avoidLabelOverlap: false,
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9', '#fa6e86', '#ff9f7f'],
        data: data.length > 0
          ? data
          : [{ name: '暂无数据', value: 1 }],
        emphasis: {
          label: {
            fontSize: '12',
            fontWeight: 'bold',
            show: true,
          },
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          position: 'center',
          show: false,
        },
        labelLine: {
          show: false,
        },
        name: '部门分布',
        radius: ['40%', '65%'],
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
