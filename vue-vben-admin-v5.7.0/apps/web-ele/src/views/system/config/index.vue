<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  ElButton as Button,
  ElDialog as Dialog,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElOption as Option,
  ElPagination as Pagination,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
} from 'element-plus';
import { createConfig, deleteConfig, getConfigList, updateConfig } from '#/api/system/config';

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
  modalTitle.value = '新增参数'; formState.value = { type: 'string' }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = '编辑参数'; formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success('保存成功'); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm(`确定要删除参数「${record.name}」吗？`, '确认删除', { type: 'warning' });
    await deleteConfig(record.id);
    message.success('删除成功');
    loadData();
  } catch { /* cancelled */ }
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
function handlePageSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.name" placeholder="参数名称" style="width: 150px" clearable />
        <Input v-model="searchForm.key" placeholder="参数键" style="width: 150px" clearable />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="primary" @click="handleAdd">新增</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="name" label="参数名称" width="150" />
        <TableColumn prop="key" label="参数键" width="200" />
        <TableColumn prop="value" label="参数值" show-overflow-tooltip width="200" />
        <TableColumn prop="type" label="类型" width="80" />
        <TableColumn prop="remark" label="备注" show-overflow-tooltip min-width="200" />
        <TableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleEdit(row)">编辑</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">删除</Button>
          </template>
        </TableColumn>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
      <Dialog v-model="modalVisible" :title="modalTitle" width="500px">
        <div class="space-y-3 py-4">
          <div><label class="mb-1 block text-sm">参数名称</label><Input v-model="formState.name" placeholder="请输入参数名称" /></div>
          <div><label class="mb-1 block text-sm">参数键</label><Input v-model="formState.key" placeholder="如 sys.name" /></div>
          <div><label class="mb-1 block text-sm">参数值</label><Input v-model="formState.value" placeholder="请输入参数值" /></div>
          <div><label class="mb-1 block text-sm">类型</label>
            <Select v-model="formState.type" style="width: 100%">
              <Option label="字符串" value="string" />
              <Option label="数字" value="number" />
              <Option label="布尔" value="boolean" />
              <Option label="JSON" value="json" />
            </Select>
          </div>
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
