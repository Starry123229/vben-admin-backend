<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NButton as Button,
  NInput as Input,
  NDataTable as DataTable,
  NModal as Modal,
  NSpace as Space,
  NTag as Tag,
  useDialog,
  useMessage,
} from 'naive-ui';
import { $t } from '#/locales';
import { createJob, deleteJob, getJobList, toggleJob, updateJob } from '#/api/system/job';

defineOptions({ name: 'SysJob' });
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = computed(() => [
  { title: $t('page.job.name'), key: 'name', width: 150 },
  { title: $t('page.job.group'), key: 'groupName', width: 100 },
  { title: $t('page.job.invokeTarget'), key: 'invokeTarget', width: 200 },
  { title: $t('page.job.cron'), key: 'cron', width: 150 },
  {
    title: $t('page.job.status'),
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'default' }, { default: () => (row.status === 1 ? $t('page.job.running') : $t('page.job.paused')) }),
  },
  { title: $t('page.common.remark'), key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: $t('page.common.action'),
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render: (row: any) =>
      h('div', { class: 'flex items-center gap-1' }, [
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleToggle(row) }, { default: () => (row.status === 1 ? $t('page.job.pause') : $t('page.job.resume')) }),
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => $t('page.common.edit') }),
        h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleDelete(row) }, { default: () => $t('page.common.delete') }),
      ]),
  },
]);

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getJobList(); }
  finally { loading.value = false; }
}

function handleAdd() { modalTitle.value = $t('page.common.addJob'); formState.value = { groupName: 'DEFAULT', status: 0 }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = $t('page.common.editJob'); formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateJob(formState.value.id, formState.value); }
    else { await createJob(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  dialog.warning({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteJobConfirm', { name: record.name }),
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => { await deleteJob(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

async function handleToggle(record: any) {
  await toggleJob(record.id);
  message.success(record.status === 1 ? $t('page.job.pausedMsg') : $t('page.job.startedMsg'));
  loadData();
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4">
        <Button type="primary" @click="handleAdd">{{ $t('page.common.addJob') }}</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="900"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <Modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 520px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">{{ $t('page.job.name') }}</label><Input v-model:value="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.group') }}</label><Input v-model:value="formState.groupName" placeholder="DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.invokeTarget') }}</label><Input v-model:value="formState.invokeTarget" placeholder="beanName.method" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.cron') }}</label><Input v-model:value="formState.cron" placeholder="0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label><Input v-model:value="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Space>
            <Button @click="modalVisible = false">{{ $t('page.common.cancel') }}</Button>
            <Button type="primary" :loading="saving" @click="handleSave">{{ $t('page.common.confirm') }}</Button>
          </Space>
        </template>
      </Modal>
    </div>
  </Page>
</template>
