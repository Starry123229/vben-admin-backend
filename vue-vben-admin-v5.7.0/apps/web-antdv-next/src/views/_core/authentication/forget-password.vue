<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { message } from 'antdv-next';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
        // 验证码输入框内嵌发送按钮：文案随倒计时变化，点击校验邮箱后发送
        createText: (countdown: number) =>
          countdown > 0 ? `${countdown}秒后重发` : '获取验证码',
        handleSendCode: async () => {
          const api = forgetRef.value?.getFormApi();
          const values: Recordable<any> | undefined = await api?.getValues();
          if (!values?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            message.warning('请先输入有效的邮箱地址');
            throw new Error('invalid email');
          }
          await sendCode(values);
        },
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
    // 倒计时由 PinInput 内嵌发送按钮的 handleSend 自行管理
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
    @submit="handleSubmit"
  />
</template>