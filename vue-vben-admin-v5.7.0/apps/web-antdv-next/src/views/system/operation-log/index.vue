<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import { message, Table, Tag, Input, Select, Button, Space } from 'ant-design-vue';

import { clearOperationLogs, exportOperationLog, getOperationLogList } from '#/api/system/log';
import { $t } from '#/locales';

defineOptions({ name: 'OperationLog' });

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({
  username: '',
  module: '',
  status: undefined as number | undefined,
});

const columns = computed(() => [
  { title: $t('page.log.username'), dataIndex: 'username', width: 120 },
  { title: $t('page.log.module'), dataIndex: 'module', width: 100 },
  { title: $t('page.log.description'), dataIndex: 'description', width: 150 },
  { title: $t('page.log.requestMethod'), dataIndex: 'requestMethod', width: 80 },
  { title: $t('page.log.requestUrl'), dataIndex: 'requestUrl', ellipsis: true, width: 200 },
  { title: $t('page.log.ip'), dataIndex: 'ip', width: 120 },
  { title: $t('page.log.costTime'), dataIndex: 'costTime', width: 90 },
  {
    title: $t('page.log.status'),
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }: any) => {
      return record.status === 1
        ? h(Tag, { color: 'green' }, () => $t('page.log.success'))
        : h(Tag, { color: 'red' }, () => $t('page.log.fail'));
    },
  },
  { title: $t('page.log.errorMsg'), dataIndex: 'errorMsg', ellipsis: true, width: 200 },
  { title: $t('page.common.createTime'), dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
]);

async function loadData() {
  loading.value = true;
  try {
    const data = await getOperationLogList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    });
    dataSource.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handleReset() {
  searchForm.value = { username: '', module: '', status: undefined };
  currentPage.value = 1;
  loadData();
}

async function handleClear() {
  await clearOperationLogs();
  message.success($t('page.common.operationSuccess'));
  loadData();
}

const exportLoading = ref(false);
async function handleExport() {
  exportLoading.value = true;
  try {
    await exportOperationLog(searchForm.value);
    message.success($t('page.common.operationSuccess'));
  } catch {
    message.error($t('page.common.operationFailed'));
  } finally { exportLoading.value = false; }
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
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model:value="searchForm.username"
          :placeholder="$t('page.log.searchUsername')"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="searchForm.module"
          :placeholder="$t('page.log.searchModule')"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="searchForm.status"
          :placeholder="$t('page.log.searchStatus')"
          style="width: 120px"
          allow-clear
          :options="[
            { label: $t('page.log.success'), value: 1 },
            { label: $t('page.log.fail'), value: 0 },
          ]"
        />
        <Space>
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
          <Button type="primary" :loading="exportLoading" @click="handleExport">{{ $t('page.common.exportExcel') }}</Button>
          <Button danger @click="handleClear">{{ $t('page.log.clearLog') }}</Button>
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
        :scroll="{ x: 1200 }"
        row-key="id"
        size="small"
      />
    </div>
  </Page>
</template>
