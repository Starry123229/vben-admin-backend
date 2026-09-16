<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import {
  NButton as Button,
  NInput as Input,
  NDataTable as DataTable,
  useDialog,
  useMessage,
} from 'naive-ui';
import { $t } from '#/locales';
import { forceLogout, getOnlineList } from '#/api/system/online';

defineOptions({ name: 'OnlineUser' });
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');
const accessStore = useAccessStore();

const columns = computed(() => [
  { title: $t('page.common.userId'), key: 'userId', width: 80 },
  { title: $t('page.common.username'), key: 'username', width: 120 },
  { title: 'Token', key: 'token', ellipsis: { tooltip: true }, width: 250 },
  { title: $t('page.common.loginTime'), key: 'loginTime', width: 180, render: (row: any) => row.loginTime ? dayjs(row.loginTime).format('YYYY-MM-DD HH:mm:ss') : '-' },
  {
    title: $t('page.common.action'),
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
    render: (row: any) =>
      h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleForceLogout(row) }, { default: () => $t('page.common.forceOffline') }),
  },
]);

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getOnlineList(searchUsername.value || undefined); }
  finally { loading.value = false; }
}

function handleSearch() { loadData(); }

function handleForceLogout(record: any) {
  if (record.token === accessStore.accessToken) {
    message.warning($t('page.common.cannotForceLogoutSelf'));
    return;
  }
  dialog.warning({
    title: $t('page.common.confirmForceOffline'), content: $t('page.common.forceOfflineConfirm', { name: record.username }),
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => {
      await forceLogout(record.token);
      message.success($t('page.common.forceOfflineSuccess', { name: record.username }));
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
        <Input v-model:value="searchUsername" :placeholder="$t('page.common.username')" style="width: 150px" clearable @keyup.enter="handleSearch" />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="loadData">{{ $t('page.common.refresh') }}</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="800"
        :pagination="false" :row-key="(row: any) => row.token" size="small">
      </DataTable>
    </div>
  </Page>
</template>
