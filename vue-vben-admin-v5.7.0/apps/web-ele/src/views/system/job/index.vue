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

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm(`确定要删除任务「${record.name}」吗？`, '确认删除', { type: 'warning' });
    await deleteJob(record.id);
    message.success('删除成功');
    loadData();
  } catch { /* cancelled */ }
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
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="name" label="任务名称" width="150" />
        <TableColumn prop="groupName" label="分组" width="100" />
        <TableColumn prop="invokeTarget" label="调用目标" width="200" />
        <TableColumn prop="cron" label="Cron表达式" width="150" />
        <TableColumn label="状态" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '运行' : '暂停' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="remark" label="备注" show-overflow-tooltip min-width="200" />
        <TableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleToggle(row)">
              {{ row.status === 1 ? '暂停' : '启动' }}
            </Button>
            <Button type="primary" link size="small" @click="handleEdit(row)">编辑</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">删除</Button>
          </template>
        </TableColumn>
      </Table>

      <Dialog v-model="modalVisible" :title="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">任务名称</label><Input v-model="formState.name" placeholder="请输入任务名称" /></div>
          <div><label class="mb-1 block text-sm">分组</label><Input v-model="formState.groupName" placeholder="如 DEFAULT" /></div>
          <div><label class="mb-1 block text-sm">调用目标</label><Input v-model="formState.invokeTarget" placeholder="如 beanName.method" /></div>
          <div><label class="mb-1 block text-sm">Cron表达式</label><Input v-model="formState.cron" placeholder="如 0 0 * * * ?" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Input v-model="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">取消</Button>
          <Button type="primary" :loading="saving" @click="handleSave">确定</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
