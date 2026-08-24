<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch, watchEffect } from 'vue';

import { isNumber } from '@vben-core/shared/utils';

import { TransitionPresets, useTransition } from '@vueuse/core';

interface Props {
  autoplay?: boolean;
  color?: string;
  decimal?: string;
  decimals?: number;
  duration?: number;
  endVal?: number;
  prefix?: string;
  separator?: string;
  startVal?: number;
  suffix?: string;
  transition?: keyof typeof TransitionPresets;
  useEasing?: boolean;
}

defineOptions({ name: 'CountToAnimator' });

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  color: '',
  decimal: '.',
  decimals: 0,
  duration: 1500,
  endVal: 2021,
  prefix: '',
  separator: ',',
  startVal: 0,
  suffix: '',
  transition: 'linear',
  useEasing: true,
});

const emit = defineEmits<{
  finished: [];
  /**
   * @deprecated 请使用{@link finished}事件
   */
  onFinished: [];
  /**
   * @deprecated 请使用{@link started}事件
   */
  onStarted: [];
  started: [];
}>();

const source = ref(Number(props.startVal) || 0);
const disabled = ref(false);

const outputValue = useTransition(source, {
  disabled,
  duration: computed(() => props.duration),
  onFinished: () => {
    emit('finished');
    emit('onFinished');
  },
  onStarted: () => {
    emit('started');
    emit('onStarted');
  },
  transition: TransitionPresets[props.transition],
});

const value = computed(() => formatNumber(unref(outputValue) as number));

watchEffect(() => {
  source.value = Number(props.startVal) || 0;
});

watch([() => props.startVal, () => props.endVal], () => {
  if (props.autoplay) {
    start();
  }
});

onMounted(() => {
  props.autoplay && start();
});

function start() {
  source.value = Number(props.endVal) || 0;
}

function reset() {
  source.value = Number(props.startVal) || 0;
  source.value = Number(props.endVal) || 0;
}

function formatNumber(num: number | string) {
  if (!num && num !== 0) {
    return '';
  }
  const { decimal, decimals, prefix, separator, suffix } = props;
  num = Number(num).toFixed(decimals);
  num += '';

  const x = num.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimal + x[1] : '';

  const rgx = /(\d+)(\d{3})/;
  if (separator && !isNumber(separator) && x1) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, `$1${separator}$2`);
    }
  }
  return prefix + x1 + x2 + suffix;
}

defineExpose({ reset });
</script>
<template>
  <span :style="{ color }">
    {{ value }}
  </span>
</template>
