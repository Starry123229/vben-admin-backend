<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { oauthCallbackApi } from '#/api/core/auth';
import { MessagePlugin as message } from 'tdesign-vue-next';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

/** 提交前校验滑块验证（schema 不再承担该校验，避免语言切换误触发提示） */
function handleLoginSubmit(values: Recordable<string>) {
  if (!values.captcha) {
    message.error($t('authentication.verifyRequiredTip'));
    return;
  }
  authStore.authLogin(values);
}

const authStore = useAuthStore();

/** 第三方登录（mock 模式后端直接签发 token；生产应跳转平台授权页） */
async function handleOauth(
  provider: 'github' | 'google' | 'qq' | 'wechat',
) {
  authStore.loginLoading = true;
  try {
    const { accessToken } = await oauthCallbackApi(provider);
    await authStore.finishLogin(accessToken);
  } finally {
    authStore.loginLoading = false;
  }
}

const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Super',
    value: 'vben',
  },
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'User',
    value: 'jack',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: MOCK_USER_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.selectAccount') })
        .optional()
        .default('vben'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount) {
            const findUser = MOCK_USER_OPTIONS.find(
              (item) => item.value === values.selectAccount,
            );
            if (findUser) {
              form.setValues({
                password: '123456',
                username: findUser.value,
              });
            }
          }
        },
        triggerFields: ['selectAccount'],
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },

    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      // 滑块验证不在 schema 里做 zod 校验：切换语言会重建 schema 触发 vee-validate
      // 重校验，导致未提交就显示「请先完成验证」。改在 handleLoginSubmit 提交时校验。
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @oauth="handleOauth"
    @submit="handleLoginSubmit"
  />
</template>
