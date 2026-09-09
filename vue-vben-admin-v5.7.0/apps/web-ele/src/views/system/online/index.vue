<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Input, message, Modal, Space, Table, Tag } from 'ant-design-vue';
import { forceLogout, getOnlineList } from '#/api/system/online';

defineOptions({ name: 'OnlineUser' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const searchUsername = ref('');

const columns = [
  { title: '用户ID', dataIndex: 'userId', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: 'Token', dataIndex: 'token', ellipsis: true, width: 250 },
  { title: '登录时间', dataIndex: 'loginTime', width: 180 },
  { title: '最后访问', dataIndex: 'lastAccessTime', width: 180 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getOnlineList(searchUsername.value || undefined); }
  finally { loading.value = false; }
}

function handleSearch() { loadData(); }

function handleForceLogout(record: any) {
  Modal.confirm({
    title: '确认下线', content: `确定要强制用户「${record.username}」下线吗？`,
    onOk: async () => { await forceLogout(record.token); message.success('已强制下线'); loadData(); },
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchUsername" placeholder="用户名" style="width: 150px" allow-clear @pressEnter="handleSearch" />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="loadData">刷新</Button>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns" :pagination="false"
        :scroll="{ x: 800 }" row-key="token" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" danger size="small" @click="handleForceLogout(record)">强制下线</Button>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>
