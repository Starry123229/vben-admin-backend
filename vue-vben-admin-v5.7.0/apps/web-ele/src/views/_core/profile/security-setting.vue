<script setup lang="ts">
import { computed } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();

/** 手机号脱敏：13800000001 -> 138****0001 */
function maskPhone(phone?: string) {
  if (!phone || phone.length < 7) return '';
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

/** 邮箱脱敏：vben@vben-demo.com -> v***@vben-demo.com */
function maskEmail(email?: string) {
  if (!email) return '';
  const [name = '', domain] = email.split('@');
  if (!domain) return '';
  return `${name.slice(0, 1)}***@${domain}`;
}

const formSchema = computed(() => {
  const userInfo = userStore.userInfo as Record<string, any> | null;
  const phone: string = userInfo?.phone ?? '';
  const email: string = userInfo?.email ?? '';
  return [
    {
      value: true,
      disabled: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.accountPassword'),
      description: $t('page.profile.accountPasswordDesc'),
    },
    {
      value: Boolean(phone),
      disabled: true,
      fieldName: 'securityPhone',
      label: $t('page.profile.securityPhone'),
      description: phone
        ? $t('page.profile.securityPhoneBound', { phone: maskPhone(phone) })
        : $t('page.profile.securityPhoneUnbound'),
    },
    {
      value: false,
      disabled: true,
      fieldName: 'securityQuestion',
      label: $t('page.profile.securityQuestion'),
      description: $t('page.profile.securityQuestionDesc'),
    },
    {
      value: Boolean(email),
      disabled: true,
      fieldName: 'securityEmail',
      label: $t('page.profile.securityEmail'),
      description: email
        ? $t('page.profile.securityEmailBound', { email: maskEmail(email) })
        : $t('page.profile.securityEmailUnbound'),
    },
    {
      value: false,
      disabled: true,
      fieldName: 'securityMfa',
      label: $t('page.profile.securityMfa'),
      description: $t('page.profile.securityMfaDesc'),
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>
