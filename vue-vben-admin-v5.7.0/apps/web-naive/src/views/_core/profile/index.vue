<script setup lang="ts">
import { computed, ref } from 'vue';

import { Profile } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';
import { useMessage } from 'naive-ui';
import { uploadAvatarApi } from '#/api/core';

import ProfileBase from './base-setting.vue';
import ProfileNotificationSetting from './notification-setting.vue';
import ProfilePasswordSetting from './password-setting.vue';
import ProfileSecuritySetting from './security-setting.vue';

const userStore = useUserStore();

const message = useMessage();

const tabsValue = ref<string>('basic');

const tabs = computed(() => [
  {
    label: $t('page.profile.basicSetting'),
    value: 'basic',
  },
  {
    label: $t('page.profile.securitySetting'),
    value: 'security',
  },
  {
    label: $t('page.profile.changePassword'),
    value: 'password',
  },
  {
    label: $t('page.profile.notificationSetting'),
    value: 'notice',
  },
]);

/** 点击头像选择图片后上传，成功即刷新全局用户信息（右上角头像同步生效） */
async function handleAvatarChange(file: File) {
  try {
    const { avatar } = await uploadAvatarApi(file);
    if (userStore.userInfo) {
      userStore.setUserInfo({ ...userStore.userInfo, avatar });
    }
    message.success($t('page.profile.avatarUpdated'));
  } catch {
    // 错误提示由请求拦截器统一处理
  }
}

</script>
<template>
  <Profile
    v-model:model-value="tabsValue"
    :title="$t('page.profile.title')"
    :user-info="userStore.userInfo"
    :tabs="tabs"
      @avatar-change="handleAvatarChange"
  >
    <template #content>
      <ProfileBase v-if="tabsValue === 'basic'" />
      <ProfileSecuritySetting v-if="tabsValue === 'security'" />
      <ProfilePasswordSetting v-if="tabsValue === 'password'" />
      <ProfileNotificationSetting v-if="tabsValue === 'notice'" />
    </template>
  </Profile>
</template>
