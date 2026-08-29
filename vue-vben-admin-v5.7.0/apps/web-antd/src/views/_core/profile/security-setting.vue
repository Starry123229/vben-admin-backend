<script setup lang="ts">
import { computed } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';
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
  const [name, domain] = email.split('@');
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
      label: '账户密码',
      description: '已设置密码，可用于账号密码登录',
    },
    {
      value: Boolean(phone),
      disabled: true,
      fieldName: 'securityPhone',
      label: '密保手机',
      description: phone
        ? `已绑定手机：${maskPhone(phone)}`
        : '未绑定手机号，绑定后可用于手机验证码登录',
    },
    {
      value: false,
      disabled: true,
      fieldName: 'securityQuestion',
      label: '密保问题',
      description: '未设置密保问题，密保问题可有效保护账户安全',
    },
    {
      value: Boolean(email),
      disabled: true,
      fieldName: 'securityEmail',
      label: '备用邮箱',
      description: email ? `已绑定邮箱：${maskEmail(email)}` : '未绑定邮箱，绑定后可用于找回密码',
    },
    {
      value: false,
      disabled: true,
      fieldName: 'securityMfa',
      label: 'MFA 设备',
      description: '未绑定 MFA 设备，绑定后可以进行二次确认（暂不支持）',
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>
