<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Dialog, Input, InputNumber, MessagePlugin as message, Select, Table, Tag, Textarea } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import { createDictData, deleteDictData, getDictDataList, updateDictData } from '#/api/system/dict';

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
  { colKey: 'label', title: '字典标签', width: 150 },
  { colKey: 'value', title: '字典值', width: 150 },
  { colKey: 'sort', title: '排序', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'cssClass', title: 'CSS样式', width: 100 },
  { colKey: 'remark', title: '备注', ellipsis: true, width: 200 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' },
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
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除', body: `确定要删除字典数据「${record.label}」吗？`,
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => { await deleteDictData(record.id); message.success('删除成功'); loadData(); confirmDialog.destroy(); },
    onClose: () => confirmDialog.destroy(),
  });
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center gap-2">
        <Button @click="router.back()">返回</Button>
        <Button theme="primary" @click="handleAdd">新增</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="id" size="small" :maxHeight="600">
        <template #status="{ row }">
          <Tag :theme="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</Tag>
        </template>
        <template #operation="{ row }">
          <Button theme="primary" variant="text" size="small" @click="handleEdit(row)">编辑</Button>
          <Button theme="danger" variant="text" size="small" @click="handleDelete(row)">删除</Button>
        </template>
      </Table>
      <Dialog v-model:visible="modalVisible" :header="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">字典标签</label><Input v-model="formState.label" placeholder="请输入字典标签" /></div>
          <div><label class="mb-1 block text-sm">字典值</label><Input v-model="formState.value" placeholder="请输入字典值" /></div>
          <div><label class="mb-1 block text-sm">排序</label><InputNumber v-model="formState.sort" :min="0" style="width: 100%" /></div>
          <div><label class="mb-1 block text-sm">状态</label>
            <Select v-model="formState.status" :options="[{label:'启用',value:1},{label:'停用',value:0}]" />
          </div>
          <div><label class="mb-1 block text-sm">CSS样式</label><Input v-model="formState.cssClass" placeholder="如 primary / success" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Textarea v-model="formState.remark" :autosize="{ minRows: 2 }" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">取消</Button>
          <Button theme="primary" :loading="saving" @click="handleSave">确定</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
