<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Input, message, Modal, Select, Space, Table, Tag } from 'ant-design-vue';
import { createJob, deleteJob, getJobList, runJob, toggleJob, updateJob } from '#/api/system/job';

import { $t } from '#/locales';

defineOptions({ name: 'SysJob' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { title: () => $t('page.job.name'), dataIndex: 'name', width: 150 },
  { title: () => $t('page.job.group'), dataIndex: 'groupName', width: 100 },
  { title: () => $t('page.job.invokeTarget'), dataIndex: 'invokeTarget', width: 200, ellipsis: true, customCell: () => ({ style: 'word-break: break-all;' }) },
  { title: () => $t('page.job.cron'), dataIndex: 'cron', width: 150 },
  {
    title: () => $t('page.job.status'), dataIndex: 'status', width: 80,
    customRender: ({ record }: any) => {
      return record.status === 1 ? h(Tag, { color: 'green' }, () => $t('page.job.running')) : h(Tag, { color: 'default' }, () => $t('page.job.paused'));
    },
  },
  { title: () => $t('page.common.remark'), dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: () => $t('page.common.action'), key: 'action', width: 250, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getJobList(); }
  finally { loading.value = false; }
}

function handleAdd() {
  modalTitle.value = $t('page.common.addJob'); formState.value = { groupName: 'DEFAULT', status: 0 }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = $t('page.common.editJob'); formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateJob(formState.value.id, formState.value); }
    else { await createJob(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteJobConfirm', { name: record.name }),
    onOk: async () => { await deleteJob(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

async function handleToggle(record: any) {
  await toggleJob(record.id);
  message.success(record.status === 1 ? $t('page.job.pausedMsg') : $t('page.job.startedMsg'));
  loadData();
}

async function handleRun(record: any) {
  await runJob(record.id);
  message.success($t('page.job.executeSuccess', { name: record.name }));
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4">
        <Button type="primary" @click="handleAdd">{{ $t('page.common.addJob') }}</Button>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns" :pagination="false"
        :scroll="{ x: 900 }" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleToggle(record)">
              {{ record.status === 1 ? $t('page.job.pause') : $t('page.job.resume') }}
            </Button>
            <Button type="link" size="small" @click="handleRun(record)">
              {{ $t('page.job.runOnce') }}
            </Button>
            <Button type="link" size="small" @click="handleEdit(record)">{{ $t('page.common.edit') }}</Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">{{ $t('page.common.delete') }}</Button>
          </template>
        </template>
      </Table>
      <Modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSave" :confirm-loading="saving">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">{{ $t('page.job.name') }}</label><Input v-model:value="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.group') }}</label><Input v-model:value="formState.groupName" placeholder="DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.invokeTarget') }}</label><Input v-model:value="formState.invokeTarget" placeholder="beanName.method" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.cron') }}</label><Input v-model:value="formState.cron" placeholder="0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label><Input.TextArea v-model:value="formState.remark" :rows="2" /></div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
