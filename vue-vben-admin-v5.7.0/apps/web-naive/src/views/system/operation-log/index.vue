<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import {
  NButton as Button,
  NInput as Input,
  NSelect as Select,
  NDataTable as DataTable,
  NPagination as Pagination,
  NTag as Tag,
  useDialog,
  useMessage,
} from 'naive-ui';
import { $t } from '#/locales';
import { clearOperationLogs, exportOperationLog, getOperationLogList } from '#/api/system/log';

defineOptions({ name: 'OperationLog' });
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ username: '', module: '', status: undefined as number | undefined });

const columns = computed(() => [
  { title: $t('page.log.username'), key: 'username', width: 120 },
  { title: $t('page.log.module'), key: 'module', width: 100 },
  { title: $t('page.log.description'), key: 'description', width: 150 },
  { title: $t('page.log.requestMethod'), key: 'requestMethod', width: 80 },
  { title: $t('page.log.requestUrl'), key: 'requestUrl', width: 200, ellipsis: { tooltip: true } },
  { title: $t('page.log.ip'), key: 'ip', width: 120 },
  { title: $t('page.log.costTime'), key: 'costTime', width: 90 },
  { title: $t('page.log.status'), key: 'status', width: 80, render: (row: any) => h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? $t('page.log.success') : $t('page.log.fail')) }) },
  { title: $t('page.log.errorMsg'), key: 'errorMsg', width: 200, ellipsis: { tooltip: true } },
  { title: $t('page.common.createTime'), key: 'createTime', width: 180, render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' },
]);

async function loadData() {
  loading.value = true;
  try {
    const data = await getOperationLogList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { username: '', module: '', status: undefined }; currentPage.value = 1; loadData(); }

function handleClear() {
  dialog.warning({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.log.clearLog') + '?',
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => { await clearOperationLogs(); message.success($t('page.common.operationSuccess')); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }

const exportLoading = ref(false);
async function handleExport() {
  exportLoading.value = true;
  try {
    await exportOperationLog(searchForm.value);
    message.success($t('page.common.exportSuccess'));
  } catch {
    message.error($t('page.common.exportFailed'));
  } finally { exportLoading.value = false; }
}
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.username" :placeholder="$t('page.log.searchUsername')" style="width: 150px" clearable />
        <Input v-model:value="searchForm.module" :placeholder="$t('page.log.searchModule')" style="width: 150px" clearable />
        <Select v-model:value="searchForm.status" :placeholder="$t('page.log.searchStatus')" style="width: 120px" clearable
          :options="[{label: $t('page.log.success'), value: 1}, {label: $t('page.log.fail'), value: 0}]" />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        <Button type="info" :loading="exportLoading" @click="handleExport">{{ $t('page.common.exportExcel') }}</Button>
        <Button type="error" @click="handleClear">{{ $t('page.log.clearLog') }}</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="1200"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <div class="mt-4 flex justify-end">
        <Pagination :page="currentPage" :page-size="pageSize" :item-count="total"
          :page-sizes="[10, 20, 50]" show-size-picker
          @update:page="handlePageChange" @update:page-size="(s: number) => { pageSize = s; currentPage = 1; loadData(); }" />
      </div>
    </div>
  </Page>
</template>
