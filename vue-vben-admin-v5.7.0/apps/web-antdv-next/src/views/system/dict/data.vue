<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antdv-next';

import {
  createDictData,
  deleteDictData,
  getDictDataList,
  updateDictData,
} from '#/api/system/dict';

import { $t } from '#/locales';

defineOptions({ name: 'DictData' });

const route = useRoute();
const router = useRouter();
const typeId = computed(() => Number(route.params.typeId));
const loading = ref(false);
const dataSource = ref<any[]>([]);

const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { title: $t('page.dict.dictLabel'), dataIndex: 'label', width: 150 },
  { title: $t('page.dict.dictValue'), dataIndex: 'value', width: 150 },
  { title: $t('page.dict.dictSort'), dataIndex: 'sort', width: 80 },
  {
    title: $t('page.common.status'),
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }: any) => {
      return record.status === 1
        ? h(Tag, { color: 'green' }, () => $t('page.common.enable'))
        : h(Tag, { color: 'red' }, () => $t('page.common.disable'));
    },
  },
  { title: $t('page.dict.cssClass'), dataIndex: 'cssClass', width: 100 },
  { title: $t('page.common.remark'), dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: $t('page.common.action'), key: 'action', width: 150, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try {
    dataSource.value = await getDictDataList(typeId.value);
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  modalTitle.value = $t('page.common.addDictData');
  formState.value = {
    typeId: typeId.value,
    sort: 0,
    status: 1,
  };
  modalVisible.value = true;
}

function handleEdit(record: any) {
  modalTitle.value = $t('page.common.editDict');
  formState.value = { ...record };
  modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) {
      await updateDictData(formState.value.id, formState.value);
    } else {
      await createDictData(formState.value);
    }
    message.success($t('page.common.saveSuccess'));
    modalVisible.value = false;
    loadData();
  } finally {
    saving.value = false;
  }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: $t('page.common.confirmDeleteTitle'),
    content: $t('page.common.deleteDictDataConfirm', { name: record.label }),
    onOk: async () => {
      await deleteDictData(record.id);
      message.success($t('page.common.deleteSuccess'));
      loadData();
    },
  });
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ $t('page.dict.dictLabel') }}</h2>
        <Space>
          <Button @click="router.back()">{{ $t('page.common.back') }}</Button>
          <Button type="primary" @click="handleAdd">{{ $t('page.common.add') }}</Button>
        </Space>
      </div>

      <Table
        :loading="loading"
        :data-source="dataSource"
        :columns="columns"
        :pagination="false"
        :scroll="{ x: 900 }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">
              {{ $t('page.common.edit') }}
            </Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">
              {{ $t('page.common.delete') }}
            </Button>
          </template>
        </template>
      </Table>

      <Modal
        v-model:open="modalVisible"
        :title="modalTitle"
        @ok="handleSave"
        :confirm-loading="saving"
      >
        <div class="space-y-3 py-4">
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.dictLabel') }}</label>
            <Input v-model:value="formState.label" :placeholder="$t('page.common.input')" />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.dictValue') }}</label>
            <Input v-model:value="formState.value" :placeholder="$t('page.common.input')" />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.dictSort') }}</label>
            <InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.common.status') }}</label>
            <Select
              v-model:value="formState.status"
              :options="[
                { label: $t('page.common.enable'), value: 1 },
                { label: $t('page.common.disable'), value: 0 },
              ]"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.cssClass') }}</label>
            <Input v-model:value="formState.cssClass" placeholder="primary / success" />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label>
            <Input.TextArea v-model:value="formState.remark" :rows="2" />
          </div>
        </div>
      </Modal>
    </div>
  </Page>
</template>
