<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
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
import { $t } from '#/locales';
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

const columns = computed(() => [
  { title: $t('page.config.configName'), key: 'name', width: 150 },
  { title: $t('page.config.configKey'), key: 'key', width: 200 },
  { title: $t('page.config.configValue'), key: 'value', ellipsis: { tooltip: true }, width: 200 },
  { title: $t('page.config.configType'), key: 'type', width: 80 },
  { title: $t('page.common.remark'), key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: $t('page.common.action'),
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (row: any) =>
      h('div', { class: 'flex items-center gap-1' }, [
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => $t('page.common.edit') }),
        h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleDelete(row) }, { default: () => $t('page.common.delete') }),
      ]),
  },
]);

async function loadData() {
  loading.value = true;
  try {
    const data = await getConfigList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { name: '', key: '' }; currentPage.value = 1; loadData(); }
function handleAdd() { modalTitle.value = $t('page.common.addConfig'); formState.value = { type: 'string' }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = $t('page.common.editConfig'); formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  dialog.warning({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteConfigConfirm', { name: record.name }),
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => { await deleteConfig(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" :placeholder="$t('page.config.configName')" style="width: 150px" clearable />
        <Input v-model:value="searchForm.key" :placeholder="$t('page.config.configKey')" style="width: 150px" clearable />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        <Button type="primary" @click="handleAdd">{{ $t('page.common.addConfig') }}</Button>
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
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configName') }}</label><Input v-model:value="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configKey') }}</label><Input v-model:value="formState.key" placeholder="sys.name" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configValue') }}</label><Input v-model:value="formState.value" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configType') }}</label>
            <Select v-model:value="formState.type" :options="[{label:'String',value:'string'},{label:'Number',value:'number'},{label:'Boolean',value:'boolean'},{label:'JSON',value:'json'}]" />
          </div>
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
