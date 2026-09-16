<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  NButton as Button,
  NDataTable as DataTable,
  NInput as Input,
  NModal as Modal,
  NSelect as Select,
  NSpace as Space,
  NTag as Tag,
} from 'naive-ui';

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

const operationOptions = [
  { label: '新增', value: 'CREATE' },
  { label: '修改', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' },
];

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: () => $t('page.auditLog.username'), key: 'username', width: 120 },
  { title: () => $t('page.auditLog.module'), key: 'module', width: 120 },
  {
    title: () => $t('page.auditLog.operation'),
    key: 'operation',
    width: 100,
    render(row: any) {
      const colorMap: Record<string, string> = {
        CREATE: 'success',
        UPDATE: 'info',
        DELETE: 'error',
      };
      const type = colorMap[row.operation] || 'default';
      return h(Tag, { type }, { default: () => row.operation || '-' });
    },
  },
  { title: () => $t('page.auditLog.entityType'), key: 'entityType', ellipsis: { tooltip: true }, width: 150 },
  { title: () => $t('page.auditLog.entityId'), key: 'entityId', width: 100 },
  { title: () => $t('page.auditLog.changedFields'), key: 'changedFields', ellipsis: { tooltip: true }, width: 250 },
  { title: () => $t('page.auditLog.ip'), key: 'ip', width: 120 },
  {
    title: () => $t('page.auditLog.createTime'),
    key: 'createTime',
    width: 180,
    render(row: any) {
      return row.createTime
        ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
        : '-';
    },
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 80,
    render(row: any) {
      return h(
        Button,
        {
          size: 'small',
          type: 'primary',
          quaternary: true,
          onClick: () => showDetail(row),
        },
        { default: () => $t('page.attachment.detail') },
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

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model:value="searchForm.module"
          :placeholder="$t('page.auditLog.searchModule')"
          style="width: 150px"
          clearable
          @keyup.enter="handleSearch"
        />
        <Input
          v-model:value="searchForm.entityType"
          :placeholder="$t('page.auditLog.searchEntityType')"
          style="width: 150px"
          clearable
          @keyup.enter="handleSearch"
        />
        <Select
          v-model:value="searchForm.operation"
          :placeholder="$t('page.auditLog.searchOperation')"
          style="width: 120px"
          clearable
          :options="operationOptions"
        />
        <Space>
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        </Space>
      </div>

      <DataTable
        :loading="loading"
        :data="dataSource"
        :columns="columns"
        :scroll-x="1300"
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

      <!-- 详情弹窗 -->
      <Modal
        v-model:show="detailModalVisible"
        :title="$t('page.auditLog.detailTitle')"
        preset="card"
        style="width: 700px"
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
            <pre class="mt-1 rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">{{ detailData.changedFields || '-' }}</pre>
          </div>
          <div>
            <strong>{{ $t('page.auditLog.oldData') }}:</strong>
            <pre class="mt-1 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">{{ detailData.oldData || '-' }}</pre>
          </div>
          <div>
            <strong>{{ $t('page.auditLog.newData') }}:</strong>
            <pre class="mt-1 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">{{ detailData.newData || '-' }}</pre>
          </div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
