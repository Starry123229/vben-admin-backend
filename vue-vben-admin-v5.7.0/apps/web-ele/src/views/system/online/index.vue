<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import {
  ElButton as Button,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElTable as Table,
  ElTableColumn as TableColumn,
} from 'element-plus';
import { forceLogout, getOnlineList } from '#/api/system/online';

defineOptions({ name: 'OnlineUser' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');
const accessStore = useAccessStore();

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getOnlineList(searchUsername.value || undefined); }
  finally { loading.value = false; }
}

function handleSearch() { loadData(); }

async function handleForceLogout(record: any) {
  if (record.token === accessStore.accessToken) {
    message.warning('不能强制下线自己，如需退出请使用退出登录功能');
    return;
  }
  try {
    await MessageBox.confirm(`确定要强制用户「${record.username}」下线吗？`, '确认下线', { type: 'warning' });
    await forceLogout(record.token);
    message.success(`已强制用户「${record.username}」下线`);
    loadData();
  } catch { /* cancelled */ }
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchUsername" placeholder="用户名" style="width: 150px" clearable @keyup.enter="handleSearch" />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="loadData">刷新</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="userId" label="用户ID" width="80" />
        <TableColumn prop="username" label="用户名" width="120" />
        <TableColumn prop="token" label="Token" show-overflow-tooltip min-width="250" />
        <TableColumn prop="loginTime" label="登录时间" width="180" />
        <TableColumn label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <Button type="danger" link size="small" @click="handleForceLogout(row)">强制下线</Button>
          </template>
        </TableColumn>
      </Table>
    </div>
  </Page>
</template>
