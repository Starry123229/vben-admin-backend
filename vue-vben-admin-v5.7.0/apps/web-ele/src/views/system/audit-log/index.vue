<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  ElButton as Button,
  ElDialog as Dialog,
  ElInput as Input,
  ElOption as Option,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';

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

function getOperationTagType(operation: string) {
  const colorMap: Record<string, string> = {
    CREATE: 'success',
    UPDATE: 'primary',
    DELETE: 'danger',
  };
  return colorMap[operation] || 'info';
}

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

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
}

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model="searchForm.module"
          :placeholder="$t('page.auditLog.searchModule')"
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <Input
          v-model="searchForm.entityType"
          :placeholder="$t('page.auditLog.searchEntityType')"
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <Select
          v-model="searchForm.operation"
          :placeholder="$t('page.auditLog.searchOperation')"
          style="width: 120px"
          clearable
        >
          <Option :label="$t('page.auditLog.create')" value="CREATE" />
          <Option :label="$t('page.auditLog.update')" value="UPDATE" />
          <Option :label="$t('page.auditLog.delete')" value="DELETE" />
        </Select>
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
      </div>

      <Table
        v-loading="loading"
        :data="dataSource"
        style="width: 100%"
        row-key="id"
        size="small"
      >
        <TableColumn prop="id" label="ID" width="80" />
        <TableColumn prop="username" :label="$t('page.auditLog.username')" width="120" />
        <TableColumn prop="module" :label="$t('page.auditLog.module')" width="120" />
        <TableColumn :label="$t('page.auditLog.operation')" width="100">
          <template #default="{ row }">
            <Tag :type="getOperationTagType(row.operation)">
              {{ row.operation || '-' }}
            </Tag>
          </template>
        </TableColumn>
        <TableColumn prop="entityType" :label="$t('page.auditLog.entityType')" width="150" show-overflow-tooltip />
        <TableColumn prop="entityId" :label="$t('page.auditLog.entityId')" width="100" />
        <TableColumn prop="changedFields" :label="$t('page.auditLog.changedFields')" width="250" show-overflow-tooltip />
        <TableColumn prop="ip" :label="$t('page.auditLog.ip')" width="120" />
        <TableColumn :label="$t('page.auditLog.createTime')" width="180">
          <template #default="{ row }">
            {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </template>
        </TableColumn>
        <TableColumn :label="$t('page.common.action')" width="80">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="showDetail(row)">
              {{ $t('page.attachment.detail') }}
            </Button>
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
            <Button
              :disabled="currentPage <= 1"
              size="small"
              @click="handlePageChange(currentPage - 1)"
            >
              上一页
            </Button>
            <span>{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
            <Button
              :disabled="currentPage >= Math.ceil(total / pageSize)"
              size="small"
              @click="handlePageChange(currentPage + 1)"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Dialog
      v-model="detailModalVisible"
      :title="$t('page.auditLog.detailTitle')"
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
    </Dialog>
  </Page>
</template>
