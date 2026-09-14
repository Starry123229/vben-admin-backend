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

import { $t } from '#/locales';

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
  modalTitle.value = $t('page.common.addConfig'); formState.value = { type: 'string' }; modalVisible.value = true;
}
function handleEdit(record: any) {
  modalTitle.value = $t('page.common.editConfig'); formState.value = { ...record }; modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (formState.value.id) { await updateConfig(formState.value.id, formState.value); }
    else { await createConfig(formState.value); }
    message.success($t('page.common.saveSuccess')); modalVisible.value = false; loadData();
  } finally { saving.value = false; }
}

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm($t('page.common.deleteConfigConfirm', { name: record.name }), $t('page.common.confirmDeleteTitle'), { type: 'warning' });
    await deleteConfig(record.id);
    message.success($t('page.common.deleteSuccess'));
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
        <Input v-model="searchForm.name" :placeholder="$t('page.config.configName')" style="width: 150px" clearable />
        <Input v-model="searchForm.key" :placeholder="$t('page.config.configKey')" style="width: 150px" clearable />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        <Button type="primary" @click="handleAdd">{{ $t('page.common.addConfig') }}</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="name" :label="$t('page.config.configName')" width="150" />
        <TableColumn prop="key" :label="$t('page.config.configKey')" width="200" />
        <TableColumn prop="value" :label="$t('page.config.configValue')" show-overflow-tooltip width="200" />
        <TableColumn prop="type" :label="$t('page.config.configType')" width="80" />
        <TableColumn prop="remark" :label="$t('page.common.remark')" show-overflow-tooltip min-width="200" />
        <TableColumn :label="$t('page.common.action')" width="150" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleEdit(row)">{{ $t('page.common.edit') }}</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">{{ $t('page.common.delete') }}</Button>
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
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configName') }}</label><Input v-model="formState.name" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configKey') }}</label><Input v-model="formState.key" placeholder="sys.name" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configValue') }}</label><Input v-model="formState.value" :placeholder="$t('page.common.input')" /></div>
          <div><label class="mb-1 block text-sm">{{ $t('page.config.configType') }}</label>
            <Select v-model="formState.type" style="width: 100%">
              <Option label="String" value="string" />
              <Option label="Number" value="number" />
              <Option label="Boolean" value="boolean" />
              <Option label="JSON" value="json" />
            </Select>
          </div>
          <div><label class="mb-1 block text-sm">{{ $t('page.common.remark') }}</label><Input v-model="formState.remark" type="textarea" :rows="2" /></div>
        </div>
        <template #footer>
          <Button @click="modalVisible = false">{{ $t('page.common.cancel') }}</Button>
          <Button type="primary" :loading="saving" @click="handleSave">{{ $t('page.common.confirm') }}</Button>
        </template>
      </Dialog>
    </div>
  </Page>
</template>
