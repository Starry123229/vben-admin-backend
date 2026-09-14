<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Input,
  message,
  Modal,
  RadioGroup,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createDictType,
  deleteDictType,
  getDictTypeList,
  updateDictType,
} from '#/api/system/dict';

import { $t } from '#/locales';

defineOptions({ name: 'DictType' });

const router = useRouter();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({
  name: '',
  code: '',
  status: undefined as number | undefined,
});

const modalVisible = ref(false);
const modalTitle = ref($t('page.common.addDict'));
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { title: $t('page.dict.dictName'), dataIndex: 'name', width: 150 },
  { title: $t('page.dict.dictType'), dataIndex: 'code', width: 200 },
  { title: $t('page.common.remark'), dataIndex: 'remark', ellipsis: true, width: 200 },
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
  { title: $t('page.common.createTime'), dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
  { title: $t('page.common.action'), key: 'action', width: 200, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try {
    const data = await getDictTypeList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    });
    dataSource.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handleReset() {
  searchForm.value = { name: '', code: '', status: undefined };
  currentPage.value = 1;
  loadData();
}

function handleAdd() {
  modalTitle.value = $t('page.common.addDict');
  formState.value = { name: '', code: '', status: 1, remark: '' };
  modalVisible.value = true;
}

function handleEdit(record: any) {
  modalTitle.value = $t('page.common.editDict');
  formState.value = { ...record };
  modalVisible.value = true;
}

function handleData(record: any) {
  router.push(`/system/tools/dict/data/${record.id}`);
}

async function handleSave() {
  if (!formState.value.name || !formState.value.code) {
    message.warning($t('page.common.input'));
    return;
  }
  saving.value = true;
  try {
    if (formState.value.id) {
      await updateDictType(formState.value.id, formState.value);
    } else {
      await createDictType(formState.value);
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
    content: $t('page.common.deleteDictConfirm', { name: record.name }),
    onOk: async () => {
      await deleteDictType(record.id);
      message.success($t('page.common.deleteSuccess'));
      loadData();
    },
  });
}

function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input
          v-model:value="searchForm.name"
          :placeholder="$t('page.dict.dictName')"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="searchForm.code"
          :placeholder="$t('page.dict.dictType')"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="searchForm.status"
          :placeholder="$t('page.common.status')"
          style="width: 120px"
          allow-clear
          :options="[
            { label: $t('page.common.enable'), value: 1 },
            { label: $t('page.common.disable'), value: 0 },
          ]"
        />
        <Space>
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
          <Button type="primary" @click="handleAdd">{{ $t('page.common.addDict') }}</Button>
        </Space>
      </div>

      <Table
        :loading="loading"
        :data-source="dataSource"
        :columns="columns"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (t: number) => $t('page.common.total') + ' ' + t + ' ' + $t('page.common.records'),
          onChange: handlePageChange,
        }"
        :scroll="{ x: 900 }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">
              {{ $t('page.common.edit') }}
            </Button>
            <Button type="link" size="small" @click="handleData(record)">
              {{ $t('page.dict.data') }}
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
        :confirm-loading="saving"
        @ok="handleSave"
      >
        <div class="space-y-3 py-4">
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.dictName') }}</label>
            <Input v-model:value="formState.name" :placeholder="$t('page.common.input')" />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.dict.dictType') }}</label>
            <Input
              v-model:value="formState.code"
              placeholder="sys_user_sex"
              :disabled="!!formState.id"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">{{ $t('page.common.status') }}</label>
            <RadioGroup
              v-model:value="formState.status"
              :options="[
                { label: $t('page.common.enable'), value: 1 },
                { label: $t('page.common.disable'), value: 0 },
              ]"
            />
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