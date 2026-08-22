<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { useQRCode } from '@vueuse/integrations/useQRCode';

import { createQrApi, pollQrApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'QrCodeLogin' });

const authStore = useAuthStore();
const loading = ref(false);
const statusText = ref('');
const ticket = ref<string>('');

const qrcode = useQRCode(computed(() => ticket.value || '-'), {
  errorCorrectionLevel: 'H',
  margin: 4,
});

let timer: ReturnType<typeof setInterval> | null = null;

async function startPolling() {
  stopPolling();
  timer = setInterval(async () => {
    try {
      const res = await pollQrApi(ticket.value);
      if (res.status === 'confirmed' && res.accessToken) {
        loading.value = true;
        statusText.value = '扫码成功，正在登录…';
        await authStore.finishLogin(res.accessToken);
        stopPolling();
      } else {
        statusText.value = '等待扫码…';
      }
    } catch {
      // 轮询失败忽略，继续等待
    }
  }, 2000);
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function init() {
  loading.value = true;
  try {
    const res = await createQrApi();
    ticket.value = res.ticket;
    statusText.value = '请使用已登录设备扫码';
    await startPolling();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  init();
});

onUnmounted(() => {
  stopPolling();
});
</script>
<template>
  <div class="mt-6 flex-col-center">
    <img v-if="ticket" :src="qrcode" alt="qrcode" class="w-1/2" />
    <div v-else class="w-1/2">
      <div class="flex-center aspect-square items-center text-sm text-muted-foreground">
        二维码加载中…
      </div>
    </div>
    <p class="mt-4 text-sm text-muted-foreground">
      {{ statusText || $t('authentication.qrcodePrompt') }}
    </p>
  </div>
</template>