<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { requestClient } from '#/api/request';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: $t('page.profile.oldPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('page.profile.oldPasswordPlaceholder'),
      },
    },
    {
      fieldName: 'newPassword',
      label: $t('page.profile.newPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.newPasswordPlaceholder'),
      },
    },
    {
      fieldName: 'confirmPassword',
      label: $t('page.profile.confirmPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.confirmPasswordPlaceholder'),
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ required_error: $t('page.profile.confirmPasswordRequired') })
            .min(1, { message: $t('page.profile.confirmPasswordRequired') })
            .refine((value) => value === newPassword, {
              message: $t('page.profile.passwordMismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

/** 提交修改密码（后端校验原密码与两次输入一致性） */
async function handleSubmit(values: Record<string, any>) {
  await requestClient.post<void>('/user/password', {
    confirmPassword: values.confirmPassword,
    newPassword: values.newPassword,
    oldPassword: values.oldPassword,
  });
  message.success($t('page.profile.passwordChanged'));
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-full max-w-md"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
