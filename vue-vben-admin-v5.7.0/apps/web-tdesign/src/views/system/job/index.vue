<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Dialog, Input, MessagePlugin as message, Table, Tag, Textarea } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import { createJob, deleteJob, getJobList, toggleJob, updateJob } from '#/api/system/job';

defineOptions({ name: 'SysJob' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { colKey: 'name', title: '任务名称', width: 150 },
  { colKey: 'groupName', title: '分组', width: 100 },
  { colKey: 'invokeTarget', title: '调用目标', width: 200 },
  { colKey: 'cron', title: 'Cron表达式', width: 150 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'remark', title: '备注', ellipsis: true, width: 200 },
  { colKey: 'operation', title: '操作', width: 200, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getJobList(); }
  finally { loading.value = false; }
}

function handleAdd() { modalTitle.value = '新增任务'; formState.value = { groupName: 'DEFAULT', status: 0 }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = '编辑任务'; formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateJob(formState.value.id, formState.value); }
    else { await createJob(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除', body: `确定要删除任务「${record.name}」吗？`,
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => { await deleteJob(record.id); message.success('删除成功'); loadData(); confirmDialog.destroy(); },
    onClose: () => confirmDialog.destroy(),
  });
}

async function handleToggle(record: any) {
  await toggleJob(record.id);
  message.success(record.status === 1 ? '已暂停' : '已启动');
  loadData();
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4">
        <Button theme="primary" @click="handleAdd">新增任务</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="id" size="small" :maxHeight="600">
        <template #status="{ row }">
          <Tag :theme="row.status === 1 ? 'success' : 'default'">{{ row.status === 1 ? '运行' : '暂停' }}</Tag>
        </template>
        <template #operation="{ row }">
          <Button theme="primary" variant="text" size="small" @click="handleToggle(row)">{{ row.status === 1 ? '暂停' : '启动' }}</Button>
          <Button theme="primary" variant="text" size="small" @click="handleEdit(row)">编辑</Button>
          <Button theme="danger" variant="text" size="small" @click="handleDelete(row)">删除</Button>
        </template>
      </Table>
      <Dialog v-model:visible="modalVisible" :header="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">任务名称</label><Input v-model="formState.name" placeholder="请输入任务名称" /></div>
          <div><label class="mb-1 block text-sm">分组</label><Input v-model="formState.groupName" placeholder="如 DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">调用目标</label><Input v-model="formState.invokeTarget" placeholder="如 beanName.method" /></div>
          <div><label class="mb-1 block text-sm">Cron表达式</label><Input v-model="formState.cron" placeholder="如 0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Textarea v-model="formState.remark" :autosize="{ minRows: 2 }" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">取消</Button>
          <Button theme="primary" :loading="saving" @click="handleSave">确定</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
