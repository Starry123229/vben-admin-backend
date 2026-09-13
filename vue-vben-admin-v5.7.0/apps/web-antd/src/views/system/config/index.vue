<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Input, message, Modal, Select, Space, Table } from 'ant-design-vue';
import { createConfig, deleteConfig, getConfigList, updateConfig } from '#/api/system/config';

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
  { title: '参数名称', dataIndex: 'name', width: 150 },
  { title: '参数键', dataIndex: 'key', width: 200 },
  { title: '参数值', dataIndex: 'value', ellipsis: true, width: 200 },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: '备注', dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
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

function handleAdd() {
  modalTitle.value = '新增参数'; formState.value = { type: 'string' }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = '编辑参数'; formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: '确认删除', content: `确定要删除参数「${record.name}」吗？`,
    onOk: async () => { await deleteConfig(record.id); message.success('删除成功'); loadData(); },
  });
}

function handlePageChange(page: number, size: number) { currentPage.value = page; pageSize.value = size; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" placeholder="参数名称" style="width: 150px" allow-clear />
        <Input v-model:value="searchForm.key" placeholder="参数键" style="width: 150px" allow-clear />
        <Space>
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
          <Button type="primary" @click="handleAdd">新增</Button>
        </Space>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns"
        :pagination="{ current: currentPage, pageSize, total: total, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条`, onChange: handlePageChange }"
        :scroll="{ x: 800 }" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">编辑</Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">删除</Button>
          </template>
        </template>
      </Table>
      <Modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSave" :confirm-loading="saving">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">参数名称</label><Input v-model:value="formState.name" placeholder="请输入参数名称" /></div>
          <div><label class="mb-1 block text-sm">参数键</label><Input v-model:value="formState.key" placeholder="如 sys.name" /></div>
          <div><label class="mb-1 block text-sm">参数值</label><Input v-model:value="formState.value" placeholder="请输入参数值" /></div>
          <div><label class="mb-1 block text-sm">类型</label>
            <Select v-model:value="formState.type" :options="[{label:'字符串',value:'string'},{label:'数字',value:'number'},{label:'布尔',value:'boolean'},{label:'JSON',value:'json'}]" />
          </div>
          <div><label class="mb-1 block text-sm">备注</label><Input.TextArea v-model:value="formState.remark" :rows="2" /></div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
