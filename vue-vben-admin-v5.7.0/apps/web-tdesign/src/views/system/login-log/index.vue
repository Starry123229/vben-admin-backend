<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import { Button, Input, MessagePlugin as message, Pagination, Select, Table, Tag } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import { clearLoginLogs, getLoginLogList } from '#/api/system/log';

defineOptions({ name: 'LoginLog' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ username: '', status: undefined as number | undefined });

const loginTypeMap: Record<string, string> = { account: '账号密码', phone: '手机验证码', qrcode: '扫码登录', oauth: '第三方' };

const columns = [
  { colKey: 'username', title: '登录用户', width: 120 },
  { colKey: 'ip', title: 'IP地址', width: 140 },
  { colKey: 'browser', title: '浏览器', width: 120, ellipsis: true },
  { colKey: 'os', title: '操作系统', width: 120, ellipsis: true },
  { colKey: 'loginType', title: '登录方式', width: 100 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'message', title: '提示消息', width: 200, ellipsis: true },
  { colKey: 'createTime', title: '登录时间', width: 180 },
];

async function loadData() {
  loading.value = true;
  try {
    const data = await getLoginLogList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { username: '', status: undefined }; currentPage.value = 1; loadData(); }

function handleClear() {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认清空', body: '确定要清空所有登录日志吗？',
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => { await clearLoginLogs(); message.success('登录日志已清空'); loadData(); confirmDialog.destroy(); },
    onClose: () => confirmDialog.destroy(),
  });
}

function handlePageChange(pageInfo: { current: number; pageSize: number }) {
  currentPage.value = pageInfo.current; pageSize.value = pageInfo.pageSize; loadData();
}
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.username" placeholder="登录用户" style="width: 150px" clearable />
        <Select v-model="searchForm.status" placeholder="状态" style="width: 120px" clearable
          :options="[{label:'成功',value:1},{label:'失败',value:0}]" />
        <Button theme="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button theme="danger" @click="handleClear">清空日志</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="id" size="small" :maxHeight="500">
        <template #loginType="{ row }">{{ loginTypeMap[row.loginType] || row.loginType || '-' }}</template>
        <template #status="{ row }">
          <Tag :theme="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '成功' : '失败' }}</Tag>
        </template>
        <template #createTime="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :current="currentPage" :pageSize="pageSize" :total="total"
          :pageSizeOptions="[10, 20, 50]" showJumper
          @change="handlePageChange" />
      </div>
    </div>
  </Page>
</template>
