<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from '#/adapter/naive';
import { resetPasswordApi, sendResetCodeApi } from '#/api/core/auth';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);
const forgetRef = ref();
const CODE_LENGTH = 6;

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.email'),
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        placeholder: '验证码',
      },
      fieldName: 'code',
      label: '验证码',
      rules: z.string().length(CODE_LENGTH, { message: `验证码为 ${CODE_LENGTH} 位` }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '新密码',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z
        .string()
        .min(6, { message: '新密码长度不能少于 6 位' }),
    },
  ];
});

/** 发送重置验证码（开发期 mock 自动填入） */
async function sendCode(values: Recordable<any>) {
  try {
    const res = await sendResetCodeApi(values.email);
    forgetRef.value?.startCountdown(60);
    if (res.mockCode) {
      await forgetRef.value?.getFormApi()?.setFieldValue('code', res.mockCode);
      message.info(`开发模式验证码已自动填入 (${values.email})`);
    } else {
      message.success('重置验证码已发送');
    }
  } catch {
    // 错误提示由请求拦截器统一处理
  }
}

/** 提交重置密码 */
async function handleSubmit(value: Recordable<any>) {
  loading.value = true;
  try {
    await resetPasswordApi(value.email, value.code, value.newPassword);
    message.success('密码重置成功，请使用新密码登录');
    // 稍后返回登录页
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1200);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationForgetPassword
    ref="forgetRef"
    :form-schema="formSchema"
    :loading="loading"
    :show-send-code="true"
    @send-code="sendCode"
    @submit="handleSubmit"
  />
</template>