<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import { CircleHelp, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';
import {
  clearNoticeApi,
  deleteNoticeApi,
  getNoticeListApi,
  markAllNoticeReadApi,
  markNoticeReadApi,
} from '#/api/system/notice';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const { isDark } = usePreferences();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => {
      openWindow('https://github.com/vbenjs/vue-vben-admin', {
        target: '_blank',
      });
    },
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
  {
    handler: () => {
      router.push({ name: 'VbenAbout' });
    },
    icon: CircleHelp,
    text: '关于',
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

/** 加载通知列表 */
async function loadNotifications() {
  try {
    const list = await getNoticeListApi();
    notifications.value = list.map((item) => ({
      ...item,
      isRead: !!item.isRead,
    })) as NotificationItem[];
  } catch (error) {
    console.error('加载通知失败:', error);
    notifications.value = [];
  }
}

/** 清空通知 */
async function handleNoticeClear() {
  try {
    await clearNoticeApi();
    notifications.value = [];
  } catch (error) {
    console.error('清空通知失败:', error);
  }
}

/** 标记单条已读 */
async function markRead(id: number | string) {
  try {
    await markNoticeReadApi(id);
    const item = notifications.value.find((item) => item.id === id);
    if (item) {
      item.isRead = true;
    }
  } catch (error) {
    console.error('标记已读失败:', error);
  }
}

/** 删除单条 */
async function remove(id: number | string) {
  try {
    await deleteNoticeApi(id);
    notifications.value = notifications.value.filter(
      (item) => item.id !== id,
    );
  } catch (error) {
    console.error('删除通知失败:', error);
  }
}

/** 全部标记已读 */
async function handleMakeAll() {
  try {
    await markAllNoticeReadApi();
    notifications.value.forEach((item) => (item.isRead = true));
  } catch (error) {
    console.error('全部标记已读失败:', error);
  }
}

const viewAll = () => {};

const handleClick = (item: NotificationItem) => {
  if (item.link) {
    navigateTo(item.link, item.query, item.state);
  }
};

function navigateTo(
  link: string,
  query?: Record<string, any>,
  state?: Record<string, any>,
) {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link, '_blank');
  } else {
    router.push({
      path: link,
      query: query || {},
      state,
    });
  }
}

onMounted(() => {
  loadNotifications();
});

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
    isDark: isDark.value,
  }),
  async ({ enable, content, isDark: isDarkValue }) => {
    if (enable) {
      const watermarkColor = isDarkValue
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';

      await updateWatermark({
        advancedStyle: {
          colorStops: [
            {
              color: watermarkColor,
              offset: 0,
            },
            {
              color: watermarkColor,
              offset: 1,
            },
          ],
          type: 'linear',
        },
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="admin@vben-demo.com"
        tag-text="Pro"
        @logout="handleLogout"
        @clear-preferences-and-logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
        @on-click="handleClick"
        @view-all="viewAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
