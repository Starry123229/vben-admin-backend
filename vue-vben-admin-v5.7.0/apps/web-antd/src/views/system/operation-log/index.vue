<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import { message, Table, Tag, Input, Select, DatePicker, Button, Space } from 'ant-design-vue';

import { clearOperationLogs, getOperationLogList } from '#/api/system/log';

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

const columns = [
  { title: '操作用户', dataIndex: 'username', width: 120 },
  { title: '操作模块', dataIndex: 'module', width: 100 },
  { title: '操作描述', dataIndex: 'description', width: 150 },
  { title: '请求方法', dataIndex: 'requestMethod', width: 80 },
  { title: '请求URL', dataIndex: 'requestUrl', ellipsis: true, width: 200 },
  { title: 'IP', dataIndex: 'ip', width: 120 },
  { title: '耗时(ms)', dataIndex: 'costTime', width: 90 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }: any) => {
      return record.status === 1
        ? h(Tag, { color: 'green' }, () => '成功')
        : h(Tag, { color: 'red' }, () => '失败');
    },
  },
  { title: '错误信息', dataIndex: 'errorMsg', ellipsis: true, width: 200 },
  { title: '操作时间', dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
];

import { h } from 'vue';

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
  message.success('操作日志已清空');
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
      <!-- 搜索栏 -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model:value="searchForm.username"
          placeholder="操作用户"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="searchForm.module"
          placeholder="操作模块"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="searchForm.status"
          placeholder="状态"
          style="width: 120px"
          allow-clear
          :options="[
            { label: '成功', value: 1 },
            { label: '失败', value: 0 },
          ]"
        />
        <Space>
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
          <Button danger @click="handleClear">清空日志</Button>
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
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: handlePageChange,
        }"
        :scroll="{ x: 1200 }"
        row-key="id"
        size="small"
      />
    </div>
  </Page>
</template>
