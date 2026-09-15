<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, Input, message, Modal, Select, Space, Table } from 'antdv-next';
import { createConfig, deleteConfig, getConfigList, updateConfig } from '#/api/system/config';

import { $t } from '#/locales';

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
  { title: $t('page.config.configName'), dataIndex: 'name', width: 150 },
  { title: $t('page.config.configKey'), dataIndex: 'key', width: 200 },
  { title: $t('page.config.configValue'), dataIndex: 'value', ellipsis: true, width: 200 },
  { title: $t('page.config.configType'), dataIndex: 'type', width: 80 },
  { title: $t('page.common.remark'), dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: $t('page.common.action'), key: 'action', width: 150, fixed: 'right' },
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
  modalTitle.value = $t('page.common.addConfig'); formState.value = { type: 'string' }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = $t('page.common.editConfig'); formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteConfigConfirm', { name: record.name }),
    onOk: async () => { await deleteConfig(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

function handlePageChange(page: number, size: number) { currentPage.value = page; pageSize.value = size; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" :placeholder="$t('page.config.configName')" style="width: 150px" allow-clear />
        <Input v-model:value="searchForm.key" :placeholder="$t('page.config.configKey')" style="width: 150px" allow-clear />
        <Space>
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
          <Button type="primary" @click="handleAdd">{{ $t('page.common.addConfig') }}</Button>
        </Space>
      </div>
      <Table :loading="loading" :data-source="dataSource" :columns="columns"
        :pagination="{ current: currentPage, pageSize, total: total, showSizeChanger: true, showTotal: (t: number) => $t('page.common.total') + ' ' + t + ' ' + $t('page.common.records'), onChange: handlePageChange }"
        :scroll="{ x: 800 }" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">{{ $t('page.common.edit') }}</Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">{{ $t('page.common.delete') }}</Button>
          </template>
        </template>
      </Table>
      <Modal v-model:open="modalVisible" :title="modalTitle" @ok="handleSave" :confirm-loading="saving">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configName') }}</label><Input v-model:value="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configKey') }}</label><Input v-model:value="formState.key" placeholder="sys.name" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configValue') }}</label><Input v-model:value="formState.value" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configType') }}</label>
            <Select v-model:value="formState.type" :options="[{label:'String',value:'string'},{label:'Number',value:'number'},{label:'Boolean',value:'boolean'},{label:'JSON',value:'json'}]" />
          </div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label><Input.TextArea v-model:value="formState.remark" :rows="2" /></div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
