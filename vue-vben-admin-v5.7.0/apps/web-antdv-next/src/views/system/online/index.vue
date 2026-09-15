<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import dayjs from 'dayjs';
import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import { Button, Input, message, Modal, Table } from 'antdv-next';
import { forceLogout, getOnlineList } from '#/api/system/online';

import { $t } from '#/locales';

defineOptions({ name: 'OnlineUser' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');

const columns = [
  { title: $t('page.common.userId'), dataIndex: 'userId', width: 80 },
  { title: $t('page.common.username'), dataIndex: 'username', width: 120 },
  { title: 'Token', dataIndex: 'token', ellipsis: true, width: 250 },
  { title: $t('page.common.loginTime'), dataIndex: 'loginTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
  { title: $t('page.common.action'), key: 'action', width: 100, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getOnlineList(searchUsername.value || undefined); }
  finally { loading.value = false; }
}

function handleSearch() { loadData(); }

const accessStore = useAccessStore();
// 当前用户的 token，用于判断是否是自己
const currentToken = computed(() => accessStore.accessToken);

function handleForceLogout(record: any) {
  // 不允许强制下线自己
  if (record.token === currentToken.value) {
    message.warning($t('page.common.cannotForceLogoutSelf'));
    return;
  }
  Modal.confirm({
    title: $t('page.common.confirmForceOffline'), content: $t('page.common.forceOfflineConfirm', { name: record.username }),
    onOk: async () => {
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
        <Input v-model:value="searchUsername" :placeholder="$t('page.common.username')" style="width: 150px" allow-clear @pressEnter="handleSearch" />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="loadData">{{ $t('page.common.refresh') }}</Button>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns" :pagination="false"
        :scroll="{ x: 800 }" row-key="token" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" danger size="small" @click="handleForceLogout(record)">{{ $t('page.common.forceOffline') }}</Button>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>
