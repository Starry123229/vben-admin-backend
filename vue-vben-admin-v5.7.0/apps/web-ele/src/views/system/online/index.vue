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

import { $t } from '#/locales';

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
    message.warning($t('page.common.cannotForceLogoutSelf'));
    return;
  }
  try {
    await MessageBox.confirm($t('page.common.forceOfflineConfirm', { name: record.username }), $t('page.common.confirmForceOffline'), { type: 'warning' });
    await forceLogout(record.token);
    message.success($t('page.common.forceOfflineSuccess', { name: record.username }));
    loadData();
  } catch { /* cancelled */ }
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchUsername" :placeholder="$t('page.common.username')" style="width: 150px" clearable @keyup.enter="handleSearch" />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="loadData">{{ $t('page.common.refresh') }}</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="userId" :label="$t('page.common.userId')" width="80" />
        <TableColumn prop="username" :label="$t('page.common.username')" width="120" />
        <TableColumn prop="token" label="Token" show-overflow-tooltip min-width="250" />
        <TableColumn prop="loginTime" :label="$t('page.common.loginTime')" width="180" />
        <TableColumn :label="$t('page.common.action')" width="100" fixed="right">
          <template #default="{ row }">
            <Button type="danger" link size="small" @click="handleForceLogout(row)">{{ $t('page.common.forceOffline') }}</Button>
          </template>
        </TableColumn>
      </Table>
    </div>
  </Page>
</template>
