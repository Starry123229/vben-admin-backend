<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  browserData?: { name: string; value: number }[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderChart();
});

watch(
  () => props.browserData,
  () => renderChart(),
  { deep: true },
);

function renderChart() {
  const data = props.browserData || [];
  const hasData = data.length > 0;

  renderEcharts({
    // 无数据时置灰显示占位扇形，避免误解为真实占比
    series: [
      {
        animationDelay() {
          return Math.random() * 400;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        center: ['50%', '50%'],
        color: hasData
          ? ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9', '#fa6e86', '#ff9f7f']
          : ['#e5e7eb'],
        data: hasData
          ? data.toSorted((a, b) => a.value - b.value)
          : [{ name: '暂无数据', value: 1 }],
        itemStyle: hasData ? {} : { opacity: 0.4 },
        label: { show: hasData },
        name: '浏览器占比',
        radius: '80%',
        roseType: 'radius',
        type: 'pie',
      },
    ],
    title: hasData
      ? undefined
      : {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: { color: '#9ca3af', fontSize: 14, fontWeight: 'normal' },
        },
    tooltip: {
      trigger: 'item',
    },
  });
}
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>