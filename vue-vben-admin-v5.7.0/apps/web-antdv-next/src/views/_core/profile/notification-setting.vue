<script setup lang="ts">
import { computed } from 'vue';

import { ProfileNotificationSetting } from '@vben/common-ui';
import { $t } from '@vben/locales';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.notificationAccountPassword'),
      description: $t('page.profile.notificationAccountPasswordDesc'),
    },
    {
      value: true,
      fieldName: 'systemMessage',
      label: $t('page.profile.systemMessage'),
      description: $t('page.profile.systemMessageDesc'),
    },
    {
      value: true,
      fieldName: 'todoTask',
      label: $t('page.profile.todoTask'),
      description: $t('page.profile.todoTaskDesc'),
    },
  ];
});
</script>
<template>
  <ProfileNotificationSetting :form-schema="formSchema" />
</template>
