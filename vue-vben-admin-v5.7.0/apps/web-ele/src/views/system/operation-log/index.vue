<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import {
  ElButton as Button,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElOption as Option,
  ElPagination as Pagination,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';
import { clearOperationLogs, getOperationLogList } from '#/api/system/log';

defineOptions({ name: 'OperationLog' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ username: '', module: '', status: undefined as number | undefined });

async function loadData() {
  loading.value = true;
  try {
    const data = await getOperationLogList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { username: '', module: '', status: undefined }; currentPage.value = 1; loadData(); }

async function handleClear() {
  try {
    await MessageBox.confirm('确定要清空所有操作日志吗？', '确认清空', { type: 'warning' });
    await clearOperationLogs();
    message.success('操作日志已清空');
    loadData();
  } catch { /* cancelled */ }
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
function handlePageSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.username" placeholder="操作用户" style="width: 150px" clearable />
        <Input v-model="searchForm.module" placeholder="操作模块" style="width: 150px" clearable />
        <Select v-model="searchForm.status" placeholder="状态" style="width: 120px" clearable>
          <Option label="成功" :value="1" />
          <Option label="失败" :value="0" />
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="danger" @click="handleClear">清空日志</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="username" label="操作用户" width="120" />
        <TableColumn prop="module" label="操作模块" width="100" />
        <TableColumn prop="description" label="操作描述" width="150" />
        <TableColumn prop="requestMethod" label="请求方法" width="80" />
        <TableColumn prop="requestUrl" label="请求URL" width="200" show-overflow-tooltip />
        <TableColumn prop="ip" label="IP" width="120" />
        <TableColumn prop="costTime" label="耗时(ms)" width="90" />
        <TableColumn label="状态" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '成功' : '失败' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="errorMsg" label="错误信息" width="200" show-overflow-tooltip />
        <TableColumn prop="createTime" label="操作时间" width="180">
          <template #default="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</template>
        </TableColumn>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :current-page="currentPage" :page-size="pageSize" :total="total"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange" @size-change="handlePageSizeChange" />
      </div>
    </div>
  </Page>
</template>
