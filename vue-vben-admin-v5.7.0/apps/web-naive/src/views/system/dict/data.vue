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

const columns = [
  { title: '字典标签', key: 'label', width: 150 },
  { title: '字典值', key: 'value', width: 150 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? '启用' : '停用') }),
  },
  { title: 'CSS样式', key: 'cssClass', width: 100 },
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
  try { dataSource.value = await getDictDataList(typeId.value); }
  finally { loading.value = false; }
}

function handleAdd() { modalTitle.value = '新增字典数据'; formState.value = { typeId: typeId.value, sort: 0, status: 1 }; modalVisible.value = true; }
function handleEdit(record: any) { modalTitle.value = '编辑字典数据'; formState.value = { ...record }; modalVisible.value = true; }

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateDictData(formState.value.id, formState.value); }
    else { await createDictData(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

function handleDelete(record: any) {
  dialog.warning({
    title: '确认删除', content: `确定要删除字典数据「${record.label}」吗？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => { await deleteDictData(record.id); message.success('删除成功'); loadData(); },
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center gap-2">
        <Button @click="router.back()">返回</Button>
        <Button type="primary" @click="handleAdd">新增</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="900"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <Modal v-model:show="modalVisible" preset="card" :title="modalTitle" style="width: 520px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">字典标签</label><Input v-model:value="formState.label" placeholder="请输入字典标签" /></div>
          <div><label class="mb-1 block text-sm">字典值</label><Input v-model:value="formState.value" placeholder="请输入字典值" /></div>
          <div><label class="mb-1 block text-sm">排序</label><InputNumber v-model:value="formState.sort" :min="0" style="width: 100%" /></div>
          <div><label class="mb-1 block text-sm">状态</label>
            <Select v-model:value="formState.status" :options="[{label:'启用',value:1},{label:'停用',value:0}]" />
          </div>
          <div><label class="mb-1 block text-sm">CSS样式</label><Input v-model:value="formState.cssClass" placeholder="如 primary / success" /></div>
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
