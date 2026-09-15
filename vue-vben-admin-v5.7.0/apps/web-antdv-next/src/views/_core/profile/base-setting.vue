<script setup lang="ts">
import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { message } from 'antdv-next';

import { getUserInfoApi, updateProfileApi } from '#/api';

const userStore = useUserStore();

const profileBaseSettingRef = ref();

// 角色仅作展示（由管理员在「角色管理」中分配，个人中心不可自行修改）
const MOCK_ROLES_OPTIONS = computed<BasicOption[]>(() => [
  {
    label: $t('page.profile.superAdmin'),
    value: 'super',
  },
  {
    label: $t('page.profile.admin'),
    value: 'admin',
  },
  {
    label: $t('page.profile.user'),
    value: 'user',
  },
]);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'realName',
      component: 'Input',
      label: $t('page.profile.realName'),
    },
    {
      fieldName: 'username',
      component: 'Input',
      label: $t('page.profile.username'),
      componentProps: { disabled: true },
      help: $t('page.profile.usernameHelp'),
    },
    {
      fieldName: 'roles',
      component: 'Select',
      modelPropName: 'value',
      componentProps: {
        mode: 'tags',
        options: MOCK_ROLES_OPTIONS.value,
        disabled: true,
      },
      label: $t('page.profile.role'),
      help: $t('page.profile.roleHelp'),
    },
    {
      fieldName: 'introduction',
      component: 'Textarea',
      componentProps: { placeholder: $t('page.profile.introductionPlaceholder') },
      label: $t('page.profile.introduction'),
    },
  ];
});

onMounted(async () => {
  const data = await getUserInfoApi();
  // 后端字段为 intro，表单字段为 introduction，做一次映射
  profileBaseSettingRef.value
    .getFormApi()
    .setValues({ ...data, introduction: (data as any)?.intro });
});

/** 提交基本设置：仅更新姓名与简介（用户名/角色只读展示） */
async function handleSubmit(values: Record<string, any>) {
  await updateProfileApi({
    intro: values.introduction ?? '',
    realName: values.realName ?? '',
  });
  // 同步更新全局用户信息（右上角昵称立即生效）
  if (userStore.userInfo) {
    userStore.setUserInfo({
      ...userStore.userInfo,
      realName: values.realName ?? userStore.userInfo.realName,
    });
  }
  message.success($t('page.profile.basicInfoUpdated'));
}
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
