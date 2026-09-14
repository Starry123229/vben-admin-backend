<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  Badge,
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
} from 'antdv-next';

import { $t } from '#/locales';
import {
  getMessageListApi,
  markAllMessageReadApi,
  markMessageReadApi,
  sendMessageApi,
} from '#/api/system/message';

defineOptions({ name: 'Message' });

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filterIsRead = ref<number | undefined>(undefined);

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: () => $t('page.message.msgTitle'), dataIndex: 'title', ellipsis: true },
  {
    title: () => $t('page.message.type'),
    dataIndex: 'type',
    width: 100,
    customRender: ({ text }: any) => {
      const colorMap: Record<string, string> = {
        notice: 'blue',
        alert: 'orange',
        task: 'green',
      };
      return h(Tag, { color: colorMap[text] || 'default' }, () => text || '-');
    },
  },
  { title: () => $t('page.message.content'), dataIndex: 'content', ellipsis: true, width: 200 },
  {
    title: () => $t('page.message.isRead'),
    dataIndex: 'isRead',
    width: 80,
    customRender: ({ text }: any) => {
      return text === 1
        ? h(Badge, { status: 'default', text: $t('page.message.read') })
        : h(Badge, { status: 'processing', text: $t('page.message.unread') });
    },
  },
  {
    title: () => $t('page.message.sendTime'),
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }: any) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 120,
    customRender: ({ record }: any) => {
      if (record.isRead === 0) {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            onClick: () => handleMarkRead(record.id),
          },
          () => $t('page.message.markRead'),
        );
      }
      return '-';
    },
  },
];

// 发送消息弹窗
const sendModalVisible = ref(false);
const sendForm = ref({
  userId: undefined as number | undefined,
  title: '',
  content: '',
  type: 'notice',
  email: '',
});

function showSendModal() {
  sendForm.value = {
    userId: undefined,
    title: '',
    content: '',
    type: 'notice',
    email: '',
  };
  sendModalVisible.value = true;
}

async function handleSend() {
  if (!sendForm.value.userId && sendForm.value.userId !== 0) {
    message.warning($t('page.message.enterUserId'));
    return;
  }
  if (!sendForm.value.title.trim()) {
    message.warning($t('page.message.enterTitle'));
    return;
  }
  await sendMessageApi({
    userId: sendForm.value.userId,
    title: sendForm.value.title,
    content: sendForm.value.content,
    type: sendForm.value.type,
    email: sendForm.value.email || undefined,
  });
  message.success($t('page.message.sendSuccess'));
  sendModalVisible.value = false;
  loadData();
}

async function loadData() {
  loading.value = true;
  try {
    const data = await getMessageListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      isRead: filterIsRead.value,
    });
    dataSource.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function handleMarkRead(id: number) {
  await markMessageReadApi(id);
  message.success($t('page.message.markedRead'));
  loadData();
}

async function handleMarkAllRead() {
  await markAllMessageReadApi();
  message.success($t('page.message.allMarkedRead'));
  loadData();
}

function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadData();
}

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Space>
          <Select
            v-model:value="filterIsRead"
            :placeholder="$t('page.message.filterRead')"
            style="width: 150px"
            allow-clear
            :options="[
              { label: $t('page.message.unread'), value: 0 },
              { label: $t('page.message.read'), value: 1 },
            ]"
            @change="
              () => {
                currentPage = 1;
                loadData();
              }
            "
          />
        </Space>
        <Space>
          <Button type="primary" @click="showSendModal">{{ $t('page.message.sendMessage') }}</Button>
          <Button @click="handleMarkAllRead">{{ $t('page.message.markAllRead') }}</Button>
        </Space>
      </div>

      <Table
        :loading="loading"
        :data-source="dataSource"
        :columns="columns"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (t: number) => `${$t('page.common.total')} ${t} ${$t('page.common.records')}`,
          onChange: handlePageChange,
        }"
        row-key="id"
        size="small"
      />
    </div>

    <!-- 发送消息弹窗 -->
    <Modal
      v-model:open="sendModalVisible"
      :title="$t('page.message.sendMessage')"
      width="600px"
      @ok="handleSend"
    >
      <Form layout="vertical">
        <FormItem :label="$t('page.message.userIdLabel')" required>
          <Input
            v-model:value="sendForm.userId"
            :placeholder="$t('page.message.userIdPlaceholder')"
            type="number"
          />
        </FormItem>
        <FormItem :label="$t('page.message.msgTitle')" required>
          <Input v-model:value="sendForm.title" :placeholder="$t('page.message.titlePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.message.content')">
          <Textarea
            v-model:value="sendForm.content"
            :placeholder="$t('page.message.contentPlaceholder')"
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('page.message.type')">
          <Select
            v-model:value="sendForm.type"
            :options="[
              { label: $t('page.message.notice'), value: 'notice' },
              { label: $t('page.message.alert'), value: 'alert' },
              { label: $t('page.message.task'), value: 'task' },
            ]"
          />
        </FormItem>
        <FormItem :label="$t('page.message.emailLabel')">
          <Input v-model:value="sendForm.email" :placeholder="$t('page.message.emailPlaceholder')" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
