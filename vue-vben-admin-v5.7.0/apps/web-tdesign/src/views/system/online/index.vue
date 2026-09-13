<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import { Button, Input, MessagePlugin as message, Table } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import { forceLogout, getOnlineList } from '#/api/system/online';

defineOptions({ name: 'OnlineUser' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');
const accessStore = useAccessStore();

const columns = [
  { colKey: 'userId', title: '用户ID', width: 80 },
  { colKey: 'username', title: '用户名', width: 120 },
  { colKey: 'token', title: 'Token', ellipsis: true, width: 250 },
  { colKey: 'loginTime', title: '登录时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' },
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
  const confirmDialog = DialogPlugin.confirm({
    header: '确认下线', body: `确定要强制用户「${record.username}」下线吗？`,
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => {
      await forceLogout(record.token);
      message.success(`已强制用户「${record.username}」下线`);
      loadData(); confirmDialog.destroy();
    },
    onClose: () => confirmDialog.destroy(),
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchUsername" placeholder="用户名" style="width: 150px" clearable @enter="handleSearch" />
        <Button theme="primary" @click="handleSearch">搜索</Button>
        <Button @click="loadData">刷新</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="token" size="small" :maxHeight="600">
        <template #operation="{ row }">
          <Button theme="danger" variant="text" size="small" @click="handleForceLogout(row)">强制下线</Button>
        </template>
      </Table>
    </div>
  </Page>
</template>
