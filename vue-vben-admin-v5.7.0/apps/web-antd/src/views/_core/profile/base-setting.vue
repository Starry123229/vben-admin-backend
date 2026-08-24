<script setup lang="ts">
import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { getUserInfoApi, updateProfileApi } from '#/api';

const userStore = useUserStore();

const profileBaseSettingRef = ref();

// 角色仅作展示（由管理员在「角色管理」中分配，个人中心不可自行修改）
const MOCK_ROLES_OPTIONS: BasicOption[] = [
  {
    label: '超级管理员',
    value: 'super',
  },
  {
    label: '管理员',
    value: 'admin',
  },
  {
    label: '用户',
    value: 'user',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'realName',
      component: 'Input',
      label: '姓名',
    },
    {
      fieldName: 'username',
      component: 'Input',
      label: '用户名',
      componentProps: { disabled: true },
      help: '用户名不可修改',
    },
    {
      fieldName: 'roles',
      component: 'Select',
      componentProps: {
        mode: 'tags',
        options: MOCK_ROLES_OPTIONS,
        disabled: true,
      },
      label: '角色',
      help: '由管理员分配，不可自行修改',
    },
    {
      fieldName: 'introduction',
      component: 'Textarea',
      componentProps: { placeholder: '介绍一下自己吧' },
      label: '个人简介',
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
  message.success('基本信息已更新');
}
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
