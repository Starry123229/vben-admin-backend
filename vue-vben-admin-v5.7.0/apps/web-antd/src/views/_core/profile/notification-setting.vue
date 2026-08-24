<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  List,
  message,
  Popconfirm,
  Tag,
} from 'ant-design-vue';

import {
  clearNoticeApi,
  deleteNoticeApi,
  getNoticeListApi,
  markAllNoticeReadApi,
  markNoticeReadApi,
} from '#/api/system/notice';

import type { NoticeApi } from '#/api/system/notice';

const loading = ref(false);
const notices = ref<NoticeApi.NoticeItem[]>([]);

const unreadCount = ref(0);

/** 加载我的站内消息 */
async function loadNotices() {
  loading.value = true;
  try {
    notices.value = await getNoticeListApi();
    recountUnread();
  } finally {
    loading.value = false;
  }
}

function recountUnread() {
  unreadCount.value = notices.value.filter((item) => !item.isRead).length;
}

const typeColorMap: Record<string, string> = {
  error: 'red',
  info: 'blue',
  success: 'green',
  warning: 'orange',
};

async function handleMarkRead(id: number | string) {
  await markNoticeReadApi(id);
  const item = notices.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
  recountUnread();
}

async function handleMarkAllRead() {
  await markAllNoticeReadApi();
  notices.value.forEach((item) => (item.isRead = true));
  recountUnread();
  message.success('已全部标记为已读');
}

async function handleDelete(id: number | string) {
  await deleteNoticeApi(id);
  notices.value = notices.value.filter((item) => item.id !== id);
  recountUnread();
}

async function handleClear() {
  await clearNoticeApi();
  notices.value = [];
  recountUnread();
  message.success('已清空全部消息');
}

onMounted(() => {
  loadNotices();
});
</script>
<template>
  <div class="w-2/3">
    <div class="mb-4 flex items-center justify-between">
      <span>
        未读消息
        <Tag v-if="unreadCount > 0" color="red">{{ unreadCount }}</Tag>
        <Tag v-else color="default">0</Tag>
      </span>
      <span class="flex gap-2">
        <Button :disabled="unreadCount === 0" @click="handleMarkAllRead">
          全部已读
        </Button>
        <Popconfirm
          title="确定清空所有消息吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleClear"
        >
          <Button danger :disabled="notices.length === 0">清空</Button>
        </Popconfirm>
      </span>
    </div>

    <List
      item-layout="horizontal"
      :data-source="notices"
      :loading="loading"
      :locale="{ emptyText: '暂无消息' }"
      :pagination="{ pageSize: 8, hideOnSinglePage: true }"
    >
      <template #renderItem="{ item }">
        <List.Item>
          <List.Item.Meta>
            <template #title>
              <div class="flex items-center gap-2">
                <span>{{ item.title }}</span>
                <Tag
                  v-if="item.type && typeColorMap[item.type]"
                  :color="typeColorMap[item.type]"
                  class="mr-0"
                >
                  {{ item.type }}
                </Tag>
              </div>
            </template>
            <template #description>
              <span class="text-muted-foreground">{{ item.date }}</span>
              <p v-if="item.message" class="mt-1">{{ item.message }}</p>
            </template>
          </List.Item.Meta>
          <template #actions>
            <Tag :color="item.isRead ? 'default' : 'processing'">
              {{ item.isRead ? '已读' : '未读' }}
            </Tag>
            <Button
              v-if="!item.isRead"
              size="small"
              @click="handleMarkRead(item.id)"
            >
              标记已读
            </Button>
            <Popconfirm
              title="确定删除这条消息吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(item.id)"
            >
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          </template>
        </List.Item>
      </template>
    </List>
  </div>
</template>
