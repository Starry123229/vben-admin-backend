<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Select, Space, Table, Tag } from 'antdv-next';

import { clearLoginLogs, exportLoginLog, getLoginLogList } from '#/api/system/log';
import { $t } from '#/locales';

defineOptions({ name: 'LoginLog' });

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({
  username: '',
  status: undefined as number | undefined,
});

const columns = computed(() => [
  { title: $t('page.log.username'), dataIndex: 'username', width: 120 },
  { title: $t('page.log.ip'), dataIndex: 'ip', width: 140 },
  { title: $t('page.log.location'), dataIndex: 'location', width: 120 },
  { title: $t('page.log.browser'), dataIndex: 'browser', width: 120, ellipsis: true },
  { title: $t('page.log.os'), dataIndex: 'os', width: 120, ellipsis: true },
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
  { title: $t('page.log.errorMsg'), dataIndex: 'message', width: 200, ellipsis: true },
  { title: $t('page.log.loginTime'), dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
]);

async function loadData() {
  loading.value = true;
  try {
    const data = await getLoginLogList({
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
  searchForm.value = { username: '', status: undefined };
  currentPage.value = 1;
  loadData();
}

async function handleClear() {
  await clearLoginLogs();
  message.success($t('page.common.operationSuccess'));
  loadData();
}

const exportLoading = ref(false);
async function handleExport() {
  exportLoading.value = true;
  try {
    await exportLoginLog(searchForm.value);
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
        :scroll="{ x: 1100 }"
        row-key="id"
        size="small"
      />
    </div>
  </Page>
</template>
