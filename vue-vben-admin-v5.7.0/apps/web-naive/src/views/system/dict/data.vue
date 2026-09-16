<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  NButton as Button,
  NInput as Input,
  NInputNumber as InputNumber,
  NModal as Modal,
  NSelect as Select,
  NDataTable as DataTable,
  NSpace as Space,
  NTag as Tag,
  useDialog,
  useMessage,
} from 'naive-ui';
import { $t } from '#/locales';
import { createDictData, deleteDictData, getDictDataList, updateDictData } from '#/api/system/dict';

defineOptions({ name: 'DictData' });
const message = useMessage();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const typeId = computed(() => Number(route.params.typeId));
const loading = ref(false);
const dataSource = ref<any[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = computed(() => [
  { title: $t('page.dict.dictLabel'), key: 'label', width: 150 },
  { title: $t('page.dict.dictValue'), key: 'value', width: 150 },
  { title: $t('page.dict.dictSort'), key: 'sort', width: 80 },
  {
    title: $t('page.common.status'),
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? $t('page.common.enable') : $t('page.common.disable')) }),
  },
  { title: $t('page.dict.cssClass'), key: 'cssClass', width: 100 },
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
  try { dataSource.value = await getDictDataList(typeId.value); }
  finally { loading.value = false; }
}

function handleAdd() { modalTitle.value = $t('page.common.addDictData'); formState.value = { typeId: typeId.value, sort: 0, status: 1 }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = $t('page.common.editDict'); formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateDictData(formState.value.id, formState.value); }
    else { await createDictData(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  dialog.warning({
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteDictDataConfirm', { name: record.label }),
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => { await deleteDictData(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center gap-2">
        <Button @click="router.back()">{{ $t('page.common.back') }}</Button>
        <Button type="primary" @click="handleAdd">{{ $t('page.common.add') }}</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="900"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <Modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 520px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">{{ $t('page.dict.dictLabel') }}</label><Input v-model:value="formState.label" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.dict.dictValue') }}</label><Input v-model:value="formState.value" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.dict.dictSort') }}</label><InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.status') }}</label>
            <Select v-model:value="formState.status" :options="[{label: $t('page.common.enable'), value: 1}, {label: $t('page.common.disable'), value: 0}]" />
          </div>
          <div><label class="mb-1 block text-sm">{{ $t('page.dict.cssClass') }}</label><Input v-model:value="formState.cssClass" placeholder="primary / success" /></div>
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
