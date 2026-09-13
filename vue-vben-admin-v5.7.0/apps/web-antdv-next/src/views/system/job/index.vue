<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Input, message, Modal, Table, Tag } from 'antdv-next';
import { createJob, deleteJob, getJobList, toggleJob, updateJob } from '#/api/system/job';

defineOptions({ name: 'SysJob' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { title: '任务名称', dataIndex: 'name', width: 150 },
  { title: '分组', dataIndex: 'groupName', width: 100 },
  { title: '调用目标', dataIndex: 'invokeTarget', width: 200 },
  { title: 'Cron表达式', dataIndex: 'cron', width: 150 },
  {
    title: '状态', dataIndex: 'status', width: 80,
    render: (_: any, record: any) => {
      return record.status === 1 ? h(Tag, { color: 'green' }, () => '运行') : h(Tag, { color: 'default' }, () => '暂停');
    },
  },
  { title: '备注', dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
];

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getJobList(); }
  finally { loading.value = false; }
}

function handleAdd() {
  modalTitle.value = '新增任务'; formState.value = { groupName: 'DEFAULT', status: 0 }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = '编辑任务'; formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateJob(formState.value.id, formState.value); }
    else { await createJob(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: '确认删除', content: `确定要删除任务「${record.name}」吗？`,
    onOk: async () => { await deleteJob(record.id); message.success('删除成功'); loadData(); },
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
        <Button type="primary" @click="handleAdd">新增任务</Button>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns" :pagination="false"
        :scroll="{ x: 900 }" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleToggle(record)">
              {{ record.status === 1 ? '暂停' : '启动' }}
            </Button>
            <Button type="link" size="small" @click="handleEdit(record)">编辑</Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">删除</Button>
          </template>
        </template>
      </Table>
      <Modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSave" :confirm-loading="saving">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">任务名称</label><Input v-model:value="formState.name" placeholder="请输入任务名称" /></div>
          <div><label class="mb-1 block text-sm">分组</label><Input v-model:value="formState.groupName" placeholder="如 DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">调用目标</label><Input v-model:value="formState.invokeTarget" placeholder="如 beanName.method" /></div>
          <div><label class="mb-1 block text-sm">Cron表达式</label><Input v-model:value="formState.cron" placeholder="如 0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Input.TextArea v-model:value="formState.remark" :rows="2" /></div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
