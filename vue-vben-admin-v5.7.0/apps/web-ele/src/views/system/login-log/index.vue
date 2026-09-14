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
import { clearLoginLogs, exportLoginLog, getLoginLogList } from '#/api/system/log';

defineOptions({ name: 'LoginLog' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ username: '', status: undefined as number | undefined });

const loginTypeMap: Record<string, string> = { account: '账号密码', phone: '手机验证码', qrcode: '扫码登录', oauth: '第三方' };

async function loadData() {
  loading.value = true;
  try {
    const data = await getLoginLogList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { username: '', status: undefined }; currentPage.value = 1; loadData(); }

async function handleClear() {
  try {
    await MessageBox.confirm('确定要清空所有登录日志吗？', '确认清空', { type: 'warning' });
    await clearLoginLogs();
    message.success('登录日志已清空');
    loadData();
  } catch { /* cancelled */ }
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
function handlePageSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; loadData(); }

const exportLoading = ref(false);
async function handleExport() {
  exportLoading.value = true;
  try {
    await exportLoginLog(searchForm.value);
    message.success('导出成功');
  } catch {
    message.error('导出失败');
  } finally { exportLoading.value = false; }
}
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.username" placeholder="登录用户" style="width: 150px" clearable />
        <Select v-model="searchForm.status" placeholder="状态" style="width: 120px" clearable>
          <Option label="成功" :value="1" />
          <Option label="失败" :value="0" />
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="success" :loading="exportLoading" @click="handleExport">导出Excel</Button>
        <Button type="danger" @click="handleClear">清空日志</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="username" label="登录用户" width="120" />
        <TableColumn prop="ip" label="IP地址" width="140" />
        <TableColumn prop="browser" label="浏览器" width="120" show-overflow-tooltip />
        <TableColumn prop="os" label="操作系统" width="120" show-overflow-tooltip />
        <TableColumn label="登录方式" width="100">
          <template #default="{ row }">{{ loginTypeMap[row.loginType] || row.loginType || '-' }}</template>
        </TableColumn>
        <TableColumn label="状态" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '成功' : '失败' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="message" label="提示消息" min-width="200" show-overflow-tooltip />
        <TableColumn prop="createTime" label="登录时间" width="180">
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
