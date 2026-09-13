<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  Button,
  Dialog,
  Input,
  InputNumber,
  MessagePlugin as message,
  Pagination,
  Select,
  Table,
  Textarea,
} from 'tdesign-vue-next';
import { createConfig, deleteConfig, getConfigList, updateConfig } from '#/api/system/config';
import { DialogPlugin } from 'tdesign-vue-next';

defineOptions({ name: 'SysConfig' });
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ name: '', key: '' });
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { colKey: 'name', title: '参数名称', width: 150 },
  { colKey: 'key', title: '参数键', width: 200 },
  { colKey: 'value', title: '参数值', ellipsis: true, width: 200 },
  { colKey: 'type', title: '类型', width: 80 },
  { colKey: 'remark', title: '备注', ellipsis: true, width: 200 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try {
    const data = await getConfigList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { name: '', key: '' }; currentPage.value = 1; loadData(); }
function handleAdd() { modalTitle.value = '新增参数'; formState.value = { type: 'string' }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = '编辑参数'; formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除', body: `确定要删除参数「${record.name}」吗？`,
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => { await deleteConfig(record.id); message.success('删除成功'); loadData(); confirmDialog.destroy(); },
    onClose: () => confirmDialog.destroy(),
  });
}

function handlePageChange(pageInfo: { current: number; pageSize: number }) {
  currentPage.value = pageInfo.current; pageSize.value = pageInfo.pageSize; loadData();
}
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.name" placeholder="参数名称" style="width: 150px" clearable />
        <Input v-model="searchForm.key" placeholder="参数键" style="width: 150px" clearable />
        <Button theme="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button theme="primary" @click="handleAdd">新增</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="id" size="small" :maxHeight="500">
        <template #operation="{ row }">
          <Button theme="primary" variant="text" size="small" @click="handleEdit(row)">编辑</Button>
          <Button theme="danger" variant="text" size="small" @click="handleDelete(row)">删除</Button>
        </template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :current="currentPage" :pageSize="pageSize" :total="total"
          :pageSizeOptions="[10, 20, 50]" showJumper
          @change="handlePageChange" />
      </div>
      <Dialog v-model:visible="modalVisible" :header="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">参数名称</label><Input v-model="formState.name" placeholder="请输入参数名称" /></div>
          <div><label class="mb-1 block text-sm">参数键</label><Input v-model="formState.key" placeholder="如 sys.name" /></div>
          <div><label class="mb-1 block text-sm">参数值</label><Input v-model="formState.value" placeholder="请输入参数值" /></div>
          <div><label class="mb-1 block text-sm">类型</label>
            <Select v-model="formState.type" :options="[{label:'字符串',value:'string'},{label:'数字',value:'number'},{label:'布尔',value:'boolean'},{label:'JSON',value:'json'}]" />
          </div>
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
