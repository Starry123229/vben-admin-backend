<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import {
  NButton as Button,
  NInput as Input,
  NDataTable as DataTable,
  useDialog,
  useMessage,
} from 'naive-ui';
import { forceLogout, getOnlineList } from '#/api/system/online';

defineOptions({ name: 'OnlineUser' });
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');
const accessStore = useAccessStore();

const columns = [
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '用户名', key: 'username', width: 120 },
  { title: 'Token', key: 'token', ellipsis: { tooltip: true }, width: 250 },
  { title: '登录时间', key: 'loginTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row: any) =>
      h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleForceLogout(row) }, { default: () => '强制下线' }),
  },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getOnlineList(searchUsername.value || undefined); }
  finally { loading.value = false; }
}

function handleSearch() { loadData(); }

function handleForceLogout(record: any) {
  if (record.token === accessStore.accessToken) {
    message.warning('不能强制下线自己，如需退出请使用退出登录功能');
    return;
  }
  dialog.warning({
    title: '确认下线', content: `确定要强制用户「${record.username}」下线吗？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => {
      await forceLogout(record.token);
      message.success(`已强制用户「${record.username}」下线`);
      loadData();
    },
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchUsername" placeholder="用户名" style="width: 150px" clearable @keyup.enter="handleSearch" />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="loadData">刷新</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="800"
        :pagination="false" :row-key="(row: any) => row.token" size="small">
      </DataTable>
    </div>
  </Page>
</template>
