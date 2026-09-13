<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
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
import { clearOperationLogs, getOperationLogList } from '#/api/system/log';

defineOptions({ name: 'OperationLog' });
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ username: '', module: '', status: undefined as number | undefined });

const columns = [
  { title: '操作用户', key: 'username', width: 120 },
  { title: '操作模块', key: 'module', width: 100 },
  { title: '操作描述', key: 'description', width: 150 },
  { title: '请求方法', key: 'requestMethod', width: 80 },
  { title: '请求URL', key: 'requestUrl', width: 200, ellipsis: { tooltip: true } },
  { title: 'IP', key: 'ip', width: 120 },
  { title: '耗时(ms)', key: 'costTime', width: 90 },
  { title: '状态', key: 'status', width: 80 },
  { title: '错误信息', key: 'errorMsg', width: 200, ellipsis: { tooltip: true } },
  { title: '操作时间', key: 'createTime', width: 180, render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' },
];

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
    title: '确认清空', content: '确定要清空所有操作日志吗？',
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => { await clearOperationLogs(); message.success('操作日志已清空'); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.username" placeholder="操作用户" style="width: 150px" clearable />
        <Input v-model:value="searchForm.module" placeholder="操作模块" style="width: 150px" clearable />
        <Select v-model:value="searchForm.status" placeholder="状态" style="width: 120px" clearable
          :options="[{label:'成功',value:1},{label:'失败',value:0}]" />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="error" @click="handleClear">清空日志</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="1200"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
        <template #status="{ row }">
          <Tag :type="row.status === 1 ? 'success' : 'error'">{{ row.status === 1 ? '成功' : '失败' }}</Tag>
        </template>
      </DataTable>
      <div class="mt-4 flex justify-end">
        <Pagination :page="currentPage" :page-size="pageSize" :item-count="total"
          :page-sizes="[10, 20, 50]" show-size-picker
          @update:page="handlePageChange" @update:page-size="(s: number) => { pageSize = s; currentPage = 1; loadData(); }" />
      </div>
    </div>
  </Page>
</template>
