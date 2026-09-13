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
  { title: '字典标签', dataIndex: 'label', width: 150 },
  { title: '字典值', dataIndex: 'value', width: 150 },
  { title: '排序', dataIndex: 'sort', width: 80 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    render: (_: any, record: any) => {
      return record.status === 1
        ? h(Tag, { color: 'green' }, () => '启用')
        : h(Tag, { color: 'red' }, () => '停用');
    },
  },
  { title: 'CSS样式', dataIndex: 'cssClass', width: 100 },
  { title: '备注', dataIndex: 'remark', ellipsis: true, width: 200 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const },
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
  modalTitle.value = '新增字典数据';
  formState.value = {
    typeId: typeId.value,
    sort: 0,
    status: 1,
  };
  modalVisible.value = true;
}

function handleEdit(record: any) {
  modalTitle.value = '编辑字典数据';
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
    content: `确定要删除字典数据「${record.label}」吗？`,
    onOk: async () => {
      await deleteDictData(record.id);
      message.success('删除成功');
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
        <Space>
          <Button @click="router.back()">返回</Button>
          <Button type="primary" @click="handleAdd">新增</Button>
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
              编辑
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
        @ok="handleSave"
        :confirm-loading="saving"
      >
        <div class="space-y-3 py-4">
          <div>
            <label class="mb-1 block text-sm">字典标签</label>
            <Input v-model:value="formState.label" placeholder="请输入字典标签" />
          </div>
          <div>
            <label class="mb-1 block text-sm">字典值</label>
            <Input v-model:value="formState.value" placeholder="请输入字典值" />
          </div>
          <div>
            <label class="mb-1 block text-sm">排序</label>
            <InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" />
          </div>
          <div>
            <label class="mb-1 block text-sm">状态</label>
            <Select
              v-model:value="formState.status"
              :options="[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">CSS样式</label>
            <Input v-model:value="formState.cssClass" placeholder="如 primary / success" />
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
