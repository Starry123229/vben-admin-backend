<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  ElButton as Button,
  ElDialog as Dialog,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';
import { createJob, deleteJob, getJobList, toggleJob, updateJob } from '#/api/system/job';

import { $t } from '#/locales';

defineOptions({ name: 'SysJob' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

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

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm($t('page.common.deleteJobConfirm', { name: record.name }), $t('page.common.confirmDeleteTitle'), { type: 'warning' });
    await deleteJob(record.id);
    message.success($t('page.common.deleteSuccess'));
    loadData();
  } catch { /* cancelled */ }
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
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="name" :label="$t('page.job.name')" width="150" />
        <TableColumn prop="groupName" :label="$t('page.job.group')" width="100" />
        <TableColumn prop="invokeTarget" :label="$t('page.job.invokeTarget')" width="200" />
        <TableColumn prop="cron" :label="$t('page.job.cron')" width="150" />
        <TableColumn :label="$t('page.job.status')" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? $t('page.job.running') : $t('page.job.paused') }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="remark" :label="$t('page.common.remark')" show-overflow-tooltip min-width="200" />
        <TableColumn :label="$t('page.common.action')" width="200" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleToggle(row)">
              {{ row.status === 1 ? $t('page.job.pause') : $t('page.job.resume') }}
            </Button>
            <Button type="primary" link size="small" @click="handleEdit(row)">{{ $t('page.common.edit') }}</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">{{ $t('page.common.delete') }}</Button>
          </template>
        </TableColumn>
      </Table>

      <Dialog v-model="modalVisible" :title="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">{{ $t('page.job.name') }}</label><Input v-model="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.group') }}</label><Input v-model="formState.groupName" placeholder="DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.invokeTarget') }}</label><Input v-model="formState.invokeTarget" placeholder="beanName.method" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.job.cron') }}</label><Input v-model="formState.cron" placeholder="0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label><Input v-model="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">{{ $t('page.common.cancel') }}</Button>
          <Button type="primary" :loading="saving" @click="handleSave">{{ $t('page.common.confirm') }}</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
