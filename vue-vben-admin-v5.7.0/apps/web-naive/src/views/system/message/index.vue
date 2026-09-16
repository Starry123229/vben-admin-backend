<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  NButton as Button,
  NDataTable as DataTable,
  NForm as Form,
  NFormItem as FormItem,
  NInput as Input,
  NModal as Modal,
  NSelect as Select,
  NSpace as Space,
  NTag as Tag,
  useMessage as useNaiveMessage,
} from 'naive-ui';

import { $t } from '#/locales';
import {
  getMessageListApi,
  markAllMessageReadApi,
  markMessageReadApi,
  sendMessageApi,
} from '#/api/system/message';

defineOptions({ name: 'Message' });

const message = useNaiveMessage();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filterIsRead = ref<number | undefined>(undefined);

const typeColorMap: Record<string, string> = {
  notice: 'info',
  alert: 'warning',
  task: 'success',
};

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: () => $t('page.message.msgTitle'), key: 'title', ellipsis: { tooltip: true } },
  {
    title: () => $t('page.message.type'),
    key: 'type',
    width: 100,
    render: (row: any) => h(Tag, { type: typeColorMap[row.type] || 'default' }, { default: () => row.type || '-' }),
  },
  { title: () => $t('page.message.content'), key: 'content', ellipsis: { tooltip: true }, width: 200 },
  {
    title: () => $t('page.message.isRead'),
    key: 'isRead',
    width: 80,
    render: (row: any) =>
      row.isRead === 1 ? $t('page.message.read') : $t('page.message.unread'),
  },
  {
    title: () => $t('page.message.sendTime'),
    key: 'createTime',
    width: 180,
    render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 120,
    render: (row: any) => {
      if (row.isRead === 0) {
        return h(
          Button,
          { size: 'small', type: 'primary', quaternary: true, onClick: () => handleMarkRead(row.id) },
          { default: () => $t('page.message.markRead') },
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
  sendForm.value = { userId: undefined, title: '', content: '', type: 'notice', email: '' };
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

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
}

function handleFilterChange() {
  currentPage.value = 1;
  loadData();
}

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Select
          v-model:value="filterIsRead"
          :placeholder="$t('page.message.filterRead')"
          style="width: 150px"
          clearable
          :options="[
            { label: $t('page.message.unread'), value: 0 },
            { label: $t('page.message.read'), value: 1 },
          ]"
          @update:value="handleFilterChange"
        />
        <Space>
          <Button type="primary" @click="showSendModal">{{ $t('page.message.sendMessage') }}</Button>
          <Button @click="handleMarkAllRead">{{ $t('page.message.markAllRead') }}</Button>
        </Space>
      </div>

      <DataTable
        :loading="loading"
        :data="dataSource"
        :columns="columns"
        :scroll-x="900"
        :pagination="{
          page: currentPage,
          pageSize: pageSize,
          itemCount: total,
          showSizePicker: true,
          pageSizes: [10, 20, 50],
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange,
        }"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </div>

    <!-- 发送消息弹窗 -->
    <Modal
      v-model:show="sendModalVisible"
      :title="$t('page.message.sendMessage')"
      preset="dialog"
      style="width: 600px"
      :positive-text="$t('page.common.confirmOk')"
      :negative-text="$t('page.common.confirmCancel')"
      @positive-click="handleSend"
    >
      <Form label-placement="top">
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
          <Input
            v-model:value="sendForm.content"
            type="textarea"
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
