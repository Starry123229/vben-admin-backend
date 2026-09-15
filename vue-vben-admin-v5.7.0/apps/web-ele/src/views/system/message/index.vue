<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  ElButton as Button,
  ElDialog as Dialog,
  ElForm as Form,
  ElFormItem as FormItem,
  ElInput as Input,
  ElMessage as message,
  ElOption as Option,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';

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

function getTagType(type: string) {
  const colorMap: Record<string, string> = {
    notice: 'primary',
    alert: 'warning',
    task: 'success',
  };
  return colorMap[type] || 'info';
}

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

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function handleSizeChange(size: number) {
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
          v-model="filterIsRead"
          :placeholder="$t('page.message.filterRead')"
          style="width: 150px"
          clearable
          @change="handleFilterChange"
        >
          <Option :label="$t('page.message.unread')" :value="0" />
          <Option :label="$t('page.message.read')" :value="1" />
        </Select>
        <div class="flex gap-2">
          <Button type="primary" @click="showSendModal">{{ $t('page.message.sendMessage') }}</Button>
          <Button @click="handleMarkAllRead">{{ $t('page.message.markAllRead') }}</Button>
        </div>
      </div>

      <Table
        v-loading="loading"
        :data="dataSource"
        style="width: 100%"
        row-key="id"
        size="small"
      >
        <TableColumn prop="id" label="ID" width="80" />
        <TableColumn prop="title" :label="$t('page.message.msgTitle')" show-overflow-tooltip />
        <TableColumn :label="$t('page.message.type')" width="100">
          <template #default="{ row }">
            <Tag :type="getTagType(row.type)">{{ row.type || '-' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="content" :label="$t('page.message.content')" width="200" show-overflow-tooltip />
        <TableColumn :label="$t('page.message.isRead')" width="80">
          <template #default="{ row }">
            <Tag :type="row.isRead === 1 ? 'info' : 'danger'">
              {{ row.isRead === 1 ? $t('page.message.read') : $t('page.message.unread') }}
            </Tag>
          </template>
        </TableColumn>
        <TableColumn :label="$t('page.message.sendTime')" width="180">
          <template #default="{ row }">
            {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </template>
        </TableColumn>
        <TableColumn :label="$t('page.common.action')" width="120">
          <template #default="{ row }">
            <Button v-if="row.isRead === 0" type="primary" link size="small" @click="handleMarkRead(row.id)">
              {{ $t('page.message.markRead') }}
            </Button>
            <span v-else>-</span>
          </template>
        </TableColumn>
      </Table>

      <div class="mt-4 flex items-center justify-between">
        <span>{{ $t('page.common.total') }} {{ total }} {{ $t('page.common.records') }}</span>
        <div class="flex items-center gap-2">
          <Select
            :model-value="pageSize"
            style="width: 120px"
            @update:model-value="handleSizeChange"
          >
            <Option label="10条/页" :value="10" />
            <Option label="20条/页" :value="20" />
            <Option label="50条/页" :value="50" />
          </Select>
          <div class="flex items-center gap-1">
            <Button :disabled="currentPage <= 1" size="small" @click="handlePageChange(currentPage - 1)">上一页</Button>
            <span>{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
            <Button :disabled="currentPage >= Math.ceil(total / pageSize)" size="small" @click="handlePageChange(currentPage + 1)">下一页</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发送消息弹窗 -->
    <Dialog
      v-model="sendModalVisible"
      :title="$t('page.message.sendMessage')"
      width="600px"
    >
      <Form label-position="top">
        <FormItem :label="$t('page.message.userIdLabel')" required>
          <Input
            v-model="sendForm.userId"
            :placeholder="$t('page.message.userIdPlaceholder')"
            type="number"
          />
        </FormItem>
        <FormItem :label="$t('page.message.msgTitle')" required>
          <Input v-model="sendForm.title" :placeholder="$t('page.message.titlePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.message.content')">
          <Input
            v-model="sendForm.content"
            type="textarea"
            :placeholder="$t('page.message.contentPlaceholder')"
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('page.message.type')">
          <Select v-model="sendForm.type" style="width: 100%">
            <Option :label="$t('page.message.notice')" value="notice" />
            <Option :label="$t('page.message.alert')" value="alert" />
            <Option :label="$t('page.message.task')" value="task" />
          </Select>
        </FormItem>
        <FormItem :label="$t('page.message.emailLabel')">
          <Input v-model="sendForm.email" :placeholder="$t('page.message.emailPlaceholder')" />
        </FormItem>
      </Form>
      <template #footer>
        <Button @click="sendModalVisible = false">取消</Button>
        <Button type="primary" @click="handleSend">确认</Button>
      </template>
    </Dialog>
  </Page>
</template>
