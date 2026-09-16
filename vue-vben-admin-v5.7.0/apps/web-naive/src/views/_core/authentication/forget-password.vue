<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useMessage } from 'naive-ui';

const message = useMessage();
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
        placeholder: $t('authentication.codePlaceholder'),
        // 验证码输入框内嵌发送按钮：文案随倒计时变化，点击校验邮箱后发送
        createText: (countdown: number) =>
          countdown > 0 ? $t('authentication.resendIn', [countdown]) : $t('authentication.getCode'),
        handleSendCode: async () => {
          const api = forgetRef.value?.getFormApi();
          const values: Recordable<any> | undefined = await api?.getValues();
          if (!values?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            message.warning($t('authentication.enterValidEmail'));
            throw new Error('invalid email');
          }
          await sendCode(values);
        },
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, { message: $t('authentication.codeLengthError', [CODE_LENGTH]) }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.newPasswordPlaceholder'),
      },
      fieldName: 'newPassword',
      label: $t('authentication.newPassword'),
      rules: z
        .string()
        .min(6, { message: $t('authentication.newPasswordMinLength') }),
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
      message.info($t('authentication.mockCodeFilled', { email: values.email }));
    } else {
      message.success($t('authentication.resetCodeSent'));
    }
  } catch (error) {
    // 错误提示由请求拦截器统一处理；继续抛出让 PinInput 不启动倒计时
    throw error;
  }
}

/** 提交重置密码 */
async function handleSubmit(value: Recordable<any>) {
  loading.value = true;
  try {
    await resetPasswordApi(value.email, value.code, value.newPassword);
    message.success($t('authentication.resetSuccess'));
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