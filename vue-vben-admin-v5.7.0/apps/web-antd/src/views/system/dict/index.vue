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
const modalTitle = ref('新增字典');
const formState = ref<any>({});
const saving = ref(false);

const columns = [
  { title: '字典名称', dataIndex: 'name', width: 150 },
  { title: '字典编码', dataIndex: 'code', width: 200 },
  { title: '备注', dataIndex: 'remark', ellipsis: true, width: 200 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }: any) => {
      return record.status === 1
        ? h(Tag, { color: 'green' }, () => '启用')
        : h(Tag, { color: 'red' }, () => '停用');
    },
  },
  { title: '创建时间', dataIndex: 'createTime', width: 180, customRender: ({ text }: any) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
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
  modalTitle.value = '新增字典';
  formState.value = { name: '', code: '', status: 1, remark: '' };
  modalVisible.value = true;
}

function handleEdit(record: any) {
  modalTitle.value = '编辑字典';
  formState.value = { ...record };
  modalVisible.value = true;
}

function handleData(record: any) {
  router.push(`/system/dict/data/${record.id}`);
}

async function handleSave() {
  if (!formState.value.name || !formState.value.code) {
    message.warning('请填写字典名称和字典编码');
    return;
  }
  saving.value = true;
  try {
    if (formState.value.id) {
      await updateDictType(formState.value.id, formState.value);
    } else {
      await createDictType(formState.value);
    }
    message.success('保存成功');
    modalVisible.value = false;
    loadData();
  } finally {
    saving.value = false;
  }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典「${record.name}」及其所有数据吗？`,
    onOk: async () => {
      await deleteDictType(record.id);
      message.success('删除成功');
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
          placeholder="字典名称"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="searchForm.code"
          placeholder="字典编码"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="searchForm.status"
          placeholder="状态"
          style="width: 120px"
          allow-clear
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
        />
        <Space>
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
          <Button type="primary" @click="handleAdd">新增字典</Button>
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
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: handlePageChange,
        }"
        :scroll="{ x: 900 }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Button type="link" size="small" @click="handleData(record)">
              数据
            </Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">
              删除
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
            <label class="mb-1 block text-sm">字典名称</label>
            <Input v-model:value="formState.name" placeholder="请输入字典名称" />
          </div>
          <div>
            <label class="mb-1 block text-sm">字典编码</label>
            <Input
              v-model:value="formState.code"
              placeholder="如 sys_user_sex"
              :disabled="!!formState.id"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">状态</label>
            <RadioGroup
              v-model:value="formState.status"
              :options="[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">备注</label>
            <Input.TextArea v-model:value="formState.remark" :rows="2" />
          </div>
        </div>
      </Modal>
    </div>
  </Page>
</template>