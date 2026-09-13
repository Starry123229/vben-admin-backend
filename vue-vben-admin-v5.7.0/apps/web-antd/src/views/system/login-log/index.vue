<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import { Button, Input, message, Select, Space, Table, Tag } from 'ant-design-vue';

import { clearLoginLogs, getLoginLogList } from '#/api/system/log';

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

const columns = [
  { title: '登录用户', dataIndex: 'username', width: 120 },
  { title: 'IP地址', dataIndex: 'ip', width: 140 },
  { title: '浏览器', dataIndex: 'browser', width: 120, ellipsis: true },
  { title: '操作系统', dataIndex: 'os', width: 120, ellipsis: true },
  {
    title: '登录方式',
    dataIndex: 'loginType',
    width: 100,
    customRender: ({ text }: any) => {
      const map: Record<string, string> = {
        account: '账号密码',
        phone: '手机验证码',
        qrcode: '扫码登录',
        oauth: '第三方',
      };
      return map[text] || text || '-';
    },
  },
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
  { title: '提示消息', dataIndex: 'message', width: 200, ellipsis: true },
  { title: '登录时间', dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
];

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
  message.success('登录日志已清空');
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
          placeholder="登录用户"
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
        :scroll="{ x: 1100 }"
        row-key="id"
        size="small"
      />
    </div>
  </Page>
</template>
