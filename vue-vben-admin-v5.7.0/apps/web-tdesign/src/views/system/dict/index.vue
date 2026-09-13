<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Input, MessagePlugin as message, Pagination, Select, Table, Tag } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import { deleteDictType, getDictTypeList } from '#/api/system/dict';

defineOptions({ name: 'DictType' });
const router = useRouter();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ name: '', code: '', status: undefined as number | undefined });

const columns = [
  { colKey: 'name', title: '字典名称', width: 150 },
  { colKey: 'code', title: '字典编码', width: 200 },
  { colKey: 'remark', title: '备注', ellipsis: true, width: 200 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'createTime', title: '创建时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try {
    const data = await getDictTypeList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { name: '', code: '', status: undefined }; currentPage.value = 1; loadData(); }
function handleEdit(record: any) { router.push(`/system/dict/data/${record.id}`); }

function handleDelete(record: any) {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除', body: `确定要删除字典「${record.name}」及其所有数据吗？`,
    confirmBtn: '确定', cancelBtn: '取消',
    onConfirm: async () => { await deleteDictType(record.id); message.success('删除成功'); loadData(); confirmDialog.destroy(); },
    onClose: () => confirmDialog.destroy(),
  });
}

function handlePageChange(pageInfo: { current: number; pageSize: number }) {
  currentPage.value = pageInfo.current; pageSize.value = pageInfo.pageSize; loadData();
}
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model="searchForm.name" placeholder="字典名称" style="width: 150px" clearable />
        <Input v-model="searchForm.code" placeholder="字典编码" style="width: 150px" clearable />
        <Select v-model="searchForm.status" placeholder="状态" style="width: 120px" clearable
          :options="[{label:'启用',value:1},{label:'停用',value:0}]" />
        <Button theme="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>
      <Table :loading="loading" :data="dataSource" :columns="columns" row-key="id" size="small" :maxHeight="500">
        <template #status="{ row }">
          <Tag :theme="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</Tag>
        </template>
        <template #createTime="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</template>
        <template #operation="{ row }">
          <Button theme="primary" variant="text" size="small" @click="handleEdit(row)">编辑</Button>
          <Button theme="danger" variant="text" size="small" @click="handleDelete(row)">删除</Button>
        </template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :current="currentPage" :pageSize="pageSize" :total="total"
          :pageSizeOptions="[10, 20, 50]" showJumper
          @change="handlePageChange" />
      </div>
    </div>
  </Page>
</template>
