<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  roleData?: { name: string; value: number }[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderChart();
});

watch(
  () => props.roleData,
  () => renderChart(),
  { deep: true },
);

function renderChart() {
  const data = props.roleData || [];

  renderEcharts({
    legend: {
      bottom: 0,
      data: data.map((d) => d.name),
    },
    radar: {
      indicator: data.length > 0
        ? data.map((d) => ({ name: d.name }))
        : [{ name: '暂无数据' }],
      radius: '60%',
      splitNumber: 8,
    },
    series: [
      {
        areaStyle: {
          opacity: 1,
          shadowBlur: 0,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
        },
        data: [
          {
            itemStyle: {
              color: '#b6a2de',
            },
            name: '角色',
            value: data.map((d) => d.value),
          },
        ],
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        symbolSize: 0,
        type: 'radar',
      },
    ],
    tooltip: {},
  });
}
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
