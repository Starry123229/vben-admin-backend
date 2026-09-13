<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
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

const columns = [
  { title: '任务名称', key: 'name', width: 150 },
  { title: '分组', key: 'groupName', width: 100 },
  { title: '调用目标', key: 'invokeTarget', width: 200 },
  { title: 'Cron表达式', key: 'cron', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'default' }, { default: () => (row.status === 1 ? '运行' : '暂停') }),
  },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render: (row: any) =>
      h('div', { class: 'flex items-center gap-1' }, [
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleToggle(row) }, { default: () => (row.status === 1 ? '暂停' : '启动') }),
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ]),
  },
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
  dialog.warning({
    title: '确认删除', content: `确定要删除任务「${record.name}」吗？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => { await deleteJob(record.id); message.success('删除成功'); loadData(); },
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
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="900"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <Modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 520px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">任务名称</label><Input v-model:value="formState.name" placeholder="请输入任务名称" /></div>
          <div><label class="mb-1 block text-sm">分组</label><Input v-model:value="formState.groupName" placeholder="如 DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">调用目标</label><Input v-model:value="formState.invokeTarget" placeholder="如 beanName.method" /></div>
          <div><label class="mb-1 block text-sm">Cron表达式</label><Input v-model:value="formState.cron" placeholder="如 0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Input v-model:value="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Space>
            <Button @click="modalVisible = false">取消</Button>
            <Button type="primary" :loading="saving" @click="handleSave">确定</Button>
          </Space>
        </template>
      </Modal>
    </div>
  </Page>
</template>
