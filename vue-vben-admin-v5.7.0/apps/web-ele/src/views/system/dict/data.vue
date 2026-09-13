<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  ElButton as Button,
  ElDialog as Dialog,
  ElInput as Input,
  ElInputNumber as InputNumber,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElOption as Option,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';
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

async function loadData() {
  loading.value = true;
  try { dataSource.value = await getDictDataList(typeId.value); }
  finally { loading.value = false; }
}

function handleAdd() {
  modalTitle.value = '新增字典数据'; formState.value = { typeId: typeId.value, sort: 0, status: 1 }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = '编辑字典数据'; formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateDictData(formState.value.id, formState.value); }
    else { await createDictData(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm(`确定要删除字典数据「${record.label}」吗？`, '确认删除', { type: 'warning' });
    await deleteDictData(record.id);
    message.success('删除成功');
    loadData();
  } catch { /* cancelled */ }
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
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="label" label="字典标签" width="150" />
        <TableColumn prop="value" label="字典值" width="150" />
        <TableColumn prop="sort" label="排序" width="80" />
        <TableColumn label="状态" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="cssClass" label="CSS样式" width="100" />
        <TableColumn prop="remark" label="备注" show-overflow-tooltip min-width="200" />
        <TableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleEdit(row)">编辑</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">删除</Button>
          </template>
        </TableColumn>
      </Table>
      <Dialog v-model="modalVisible" :title="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">字典标签</label><Input v-model="formState.label" placeholder="请输入字典标签" /></div>
          <div><label class="mb-1 block text-sm">字典值</label><Input v-model="formState.value" placeholder="请输入字典值" /></div>
          <div><label class="mb-1 block text-sm">排序</label><InputNumber v-model="formState.sort" :min="0" style="width: 100%" /></div>
          <div><label class="mb-1 block text-sm">状态</label>
            <Select v-model="formState.status" style="width: 100%">
              <Option label="启用" :value="1" />
              <Option label="停用" :value="0" />
            </Select>
          </div>
          <div><label class="mb-1 block text-sm">CSS样式</label><Input v-model="formState.cssClass" placeholder="如 primary / success" /></div>
          <div><label class="mb-1 block text-sm">备注</label><Input v-model="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">取消</Button>
          <Button type="primary" :loading="saving" @click="handleSave">确定</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
