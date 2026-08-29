<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal, useVbenModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences, usePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

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
      router.push('/profile');
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

/** 轮询间隔(ms):登录期间检测新到达的通知并自动弹窗提醒 */
const NOTICE_POLL_INTERVAL = 30 * 1000;
let noticePollTimer: ReturnType<typeof setInterval> | undefined;
/** 首次加载完成标记:首次加载不触发自动弹窗 */
let noticesInitialized = false;

/** 加载/刷新通知列表 */
async function loadNotifications() {
  try {
    const list = await getNoticeListApi();
    const previousIds = new Set(notifications.value.map((item) => item.id));
    const mapped = list.map((item) => ({
      ...item,
      avatar: item.avatar || preferences.app.defaultAvatar,
      isRead: !!item.isRead,
    })) as NotificationItem[];
    notifications.value = mapped;

    // 登录期间新到达的未读消息：自动弹出详情提醒（打开即标记已读）
    if (noticesInitialized) {
      const fresh = mapped.find(
        (item) => !item.isRead && !previousIds.has(item.id),
      );
      if (fresh) {
        openDetail(fresh);
      }
    }
    noticesInitialized = true;
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

/** 消息详情弹窗（打开即视为已读） */
const [DetailModal, detailModalApi] = useVbenModal({ footer: false });

/** 全部消息列表弹窗 */
const [ListModal, listModalApi] = useVbenModal({ footer: false });

/** 当前查看的消息 */
const activeNotice = ref<NotificationItem>();

/** 打开消息详情弹窗，并标记为已读 */
function openDetail(item: NotificationItem) {
  activeNotice.value = item;
  detailModalApi.setState({ title: item.title });
  detailModalApi.open();
  if (!item.isRead && item.id != null) {
    markRead(item.id);
  }
}

/** 点击铃铛下拉中的单条消息：弹出详情 */
const handleClick = (item: NotificationItem) => {
  openDetail(item);
};

/** 「查看所有」：打开全部消息列表 */
const viewAll = () => {
  listModalApi.open();
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
  noticePollTimer = setInterval(() => {
    loadNotifications();
  }, NOTICE_POLL_INTERVAL);
});

onBeforeUnmount(() => {
  if (noticePollTimer) {
    clearInterval(noticePollTimer);
  }
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
        :description="userStore.userInfo?.email ?? ''"
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
        @click="handleClick"
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

      <!-- 消息详情弹窗 -->
      <DetailModal class="w-[480px]" title="消息详情">
      <div v-if="activeNotice" class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <img
            :src="activeNotice.avatar"
            alt=""
            class="size-10 rounded-full object-cover"
          />
          <div>
            <p class="font-semibold">{{ activeNotice.title }}</p>
            <p class="text-muted-foreground text-xs">
              {{ activeNotice.date }}
            </p>
          </div>
        </div>
        <p class="whitespace-pre-wrap text-sm leading-6">
          {{ activeNotice.message }}
        </p>
        <div v-if="activeNotice.link" class="text-right">
          <a
            class="text-primary cursor-pointer text-sm"
            @click="
              () => {
                detailModalApi.close();
                navigateTo(
                  activeNotice?.link ?? '',
                  activeNotice?.query,
                  activeNotice?.state,
                );
              }
            "
          >
            前往查看 →
          </a>
        </div>
      </div>
    </DetailModal>

    <!-- 全部通知消息列表弹窗 -->
    <ListModal class="w-[520px]" title="全部通知消息">
      <ul class="flex max-h-[400px] flex-col overflow-y-auto">
        <li
          v-for="item in notifications"
          :key="item.id ?? item.title"
          class="hover:bg-accent border-border relative flex cursor-pointer items-start gap-3 border-b p-3 last:border-b-0"
          @click="openDetail(item)"
        >
          <span
            v-if="!item.isRead"
            class="bg-primary absolute top-2 right-2 size-2 rounded-sm"
          ></span>
          <img
            :src="item.avatar"
            alt=""
            class="size-9 shrink-0 rounded-full object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">{{ item.title }}</p>
            <p class="text-muted-foreground my-1 line-clamp-2 text-xs">
              {{ item.message }}
            </p>
            <p class="text-muted-foreground text-xs">{{ item.date }}</p>
          </div>
        </li>
        <li
          v-if="notifications.length === 0"
          class="text-muted-foreground p-6 text-center text-sm"
        >
          暂无通知消息
        </li>
      </ul>
    </ListModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
