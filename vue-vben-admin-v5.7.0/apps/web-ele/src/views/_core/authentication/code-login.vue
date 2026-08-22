<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { AuthenticationCodeLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { phoneLoginApi, sendSmsApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'CodeLogin' });

const loading = ref(false);
const CODE_LENGTH = 6;
const authStore = useAuthStore();
const codeLoginRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.mobile'),
      },
      fieldName: 'phoneNumber',
      label: $t('authentication.mobile'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.mobileTip') })
        .refine((v) => /^\d{11}$/.test(v), {
          message: $t('authentication.mobileErrortip'),
        }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          const text =
            countdown > 0
              ? $t('authentication.sendText', [countdown])
              : $t('authentication.sendCode');
          return text;
        },
        placeholder: $t('authentication.code'),
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

/** 发送短信验证码（开发期 mock 直接回填验证码方便联调） */
async function sendCode(values: Recordable<any>) {
  try {
    const res = await sendSmsApi(values.phoneNumber);
    codeLoginRef.value?.startCountdown(60);
    if (res.mockCode) {
      await codeLoginRef.value?.getFormApi()?.setFieldValue('code', res.mockCode);
      phoneLoginHint(values.phoneNumber, res.mockCode);
    } else {
      ElMessage.success('验证码已发送');
    }
  } catch {
    // 错误提示由请求拦截器统一处理
  }
}

function phoneLoginHint(_phone: string, _code: string) {
  ElMessage.info(`开发模式验证码已自动填入 (${_phone})`);
}

/** 手机号 + 验证码登录 */
async function handleLogin(values: Recordable<any>) {
  loading.value = true;
  try {
    const { accessToken } = await phoneLoginApi(values.phoneNumber, values.code);
    await authStore.finishLogin(accessToken);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationCodeLogin
    ref="codeLoginRef"
    :form-schema="formSchema"
    :loading="loading"
    :show-send-code="true"
    @send-code="sendCode"
    @submit="handleLogin"
  />
</template>