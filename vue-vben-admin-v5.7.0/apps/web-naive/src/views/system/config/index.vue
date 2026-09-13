<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NButton as Button,
  NInput as Input,
  NModal as Modal,
  NPagination as Pagination,
  NSelect as Select,
  NSpace as Space,
  NDataTable as DataTable,
  useDialog,
  useMessage,
} from 'naive-ui';
import { createConfig, deleteConfig, getConfigList, updateConfig } from '#/api/system/config';

defineOptions({ name: 'SysConfig' });
const message = useMessage();
const dialog = useDialog();
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
  { title: '参数名称', key: 'name', width: 150 },
  { title: '参数键', key: 'key', width: 200 },
  { title: '参数值', key: 'value', ellipsis: { tooltip: true }, width: 200 },
  { title: '类型', key: 'type', width: 80 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row: any) =>
      h('div', { class: 'flex items-center gap-1' }, [
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ]),
  },
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
  dialog.warning({
    title: '确认删除', content: `确定要删除参数「${record.name}」吗？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => { await deleteConfig(record.id); message.success('删除成功'); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" placeholder="参数名称" style="width: 150px" clearable />
        <Input v-model:value="searchForm.key" placeholder="参数键" style="width: 150px" clearable />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="primary" @click="handleAdd">新增</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="800"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <div class="mt-4 flex justify-end">
        <Pagination :page="currentPage" :page-size="pageSize" :item-count="total"
          :page-sizes="[10, 20, 50]" show-size-picker
          @update:page="handlePageChange" @update:page-size="(s: number) => { pageSize = s; currentPage = 1; loadData(); }" />
      </div>
      <Modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 520px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">参数名称</label><Input v-model:value="formState.name" placeholder="请输入参数名称" /></div>
          <div><label class="mb-1 block text-sm">参数键</label><Input v-model:value="formState.key" placeholder="如 sys.name" /></div>
          <div><label class="mb-1 block text-sm">参数值</label><Input v-model:value="formState.value" placeholder="请输入参数值" /></div>
          <div><label class="mb-1 block text-sm">类型</label>
            <Select v-model:value="formState.type" :options="[{label:'字符串',value:'string'},{label:'数字',value:'number'},{label:'布尔',value:'boolean'},{label:'JSON',value:'json'}]" />
          </div>
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
