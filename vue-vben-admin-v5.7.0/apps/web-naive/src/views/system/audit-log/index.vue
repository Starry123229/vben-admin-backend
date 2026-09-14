<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import { Button, Input, Modal, Select, Space, Table, Tag } from 'naive-ui';

import { $t } from '#/locales';
import { getAuditLogListApi } from '#/api/system/audit-log';

defineOptions({ name: 'AuditLog' });

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({
  module: '',
  entityType: '',
  operation: undefined as string | undefined,
});

// 详情弹窗
const detailModalVisible = ref(false);
const detailData = ref<any>({});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: () => $t('page.auditLog.username'), dataIndex: 'username', width: 120 },
  { title: () => $t('page.auditLog.module'), dataIndex: 'module', width: 120 },
  {
    title: () => $t('page.auditLog.operation'),
    dataIndex: 'operation',
    width: 100,
    customRender: ({ text }: any) => {
      const colorMap: Record<string, string> = {
        CREATE: 'green',
        UPDATE: 'blue',
        DELETE: 'red',
      };
      return h(
        Tag,
        { color: colorMap[text] || 'default' },
        () => text || '-',
      );
    },
  },
  { title: () => $t('page.auditLog.entityType'), dataIndex: 'entityType', ellipsis: true, width: 150 },
  { title: () => $t('page.auditLog.entityId'), dataIndex: 'entityId', width: 100 },
  { title: () => $t('page.auditLog.changedFields'), dataIndex: 'changedFields', ellipsis: true, width: 250 },
  { title: () => $t('page.auditLog.ip'), dataIndex: 'ip', width: 120 },
  {
    title: () => $t('page.auditLog.createTime'),
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }: any) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 80,
    customRender: ({ record }: any) => {
      return h(
        Button,
        {
          size: 'small',
          type: 'link',
          onClick: () => showDetail(record),
        },
        () => $t('page.attachment.detail'),
      );
    },
  },
];

function showDetail(record: any) {
  detailData.value = record;
  detailModalVisible.value = true;
}

async function loadData() {
  loading.value = true;
  try {
    const data = await getAuditLogListApi({
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
  searchForm.value = { module: '', entityType: '', operation: undefined };
  currentPage.value = 1;
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
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model:value="searchForm.module"
          :placeholder="$t('page.auditLog.searchModule')"
          style="width: 150px"
          allow-clear
          @press-enter="handleSearch"
        />
        <Input
          v-model:value="searchForm.entityType"
          :placeholder="$t('page.auditLog.searchEntityType')"
          style="width: 150px"
          allow-clear
          @press-enter="handleSearch"
        />
        <Select
          v-model:value="searchForm.operation"
          :placeholder="$t('page.auditLog.searchOperation')"
          style="width: 120px"
          allow-clear
          :options="[
            { label: $t('page.auditLog.create'), value: 'CREATE' },
            { label: $t('page.auditLog.update'), value: 'UPDATE' },
            { label: $t('page.auditLog.delete'), value: 'DELETE' },
          ]"
        />
        <Space>
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
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
        :scroll="{ x: 1300 }"
        row-key="id"
        size="small"
      />
    </div>

    <!-- 详情弹窗 -->
    <Modal
      v-model:open="detailModalVisible"
      :title="$t('page.auditLog.detailTitle')"
      :footer="null"
      width="700px"
    >
      <div class="space-y-3">
        <div><strong>ID:</strong> {{ detailData.id }}</div>
        <div><strong>{{ $t('page.auditLog.username') }}:</strong> {{ detailData.username }} (ID: {{ detailData.userId }})</div>
        <div><strong>{{ $t('page.auditLog.module') }}:</strong> {{ detailData.module }}</div>
        <div><strong>{{ $t('page.auditLog.operation') }}:</strong> {{ detailData.operation }}</div>
        <div><strong>{{ $t('page.auditLog.entityType') }}:</strong> {{ detailData.entityType }}</div>
        <div><strong>{{ $t('page.auditLog.entityId') }}:</strong> {{ detailData.entityId }}</div>
        <div><strong>{{ $t('page.auditLog.ip') }}:</strong> {{ detailData.ip }}</div>
        <div>
          <strong>{{ $t('page.auditLog.createTime') }}:</strong>
          {{ detailData.createTime ? dayjs(detailData.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </div>
        <div>
          <strong>{{ $t('page.auditLog.changedFields') }}:</strong>
          <pre class="mt-1 rounded bg-gray-100 p-2 text-xs">{{ detailData.changedFields || '-' }}</pre>
        </div>
        <div>
          <strong>{{ $t('page.auditLog.oldData') }}:</strong>
          <pre class="mt-1 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs">{{ detailData.oldData || '-' }}</pre>
        </div>
        <div>
          <strong>{{ $t('page.auditLog.newData') }}:</strong>
          <pre class="mt-1 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs">{{ detailData.newData || '-' }}</pre>
        </div>
      </div>
    </Modal>
  </Page>
</template>
