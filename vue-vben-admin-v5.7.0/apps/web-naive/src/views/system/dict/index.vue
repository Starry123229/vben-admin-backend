<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  NButton as Button,
  NInput as Input,
  NSelect as Select,
  NDataTable as DataTable,
  NPagination as Pagination,
  NTag as Tag,
  useDialog,
  useMessage,
} from 'naive-ui';
import { deleteDictType, getDictTypeList } from '#/api/system/dict';

defineOptions({ name: 'DictType' });
const message = useMessage();
const dialog = useDialog();
const router = useRouter();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ name: '', code: '', status: undefined as number | undefined });

const columns = [
  { title: '字典名称', key: 'name', width: 150 },
  { title: '字典编码', key: 'code', width: 200 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? '启用' : '停用') }),
  },
  { title: '创建时间', key: 'createTime', width: 180, render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' },
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
  try {
    const data = await getDictTypeList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items; total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { name: '', code: '', status: undefined }; currentPage.value = 1; loadData(); }
function handleEdit(record: any) { router.push(`/system/tools/dict/data/${record.id}`); }

function handleDelete(record: any) {
  dialog.warning({
    title: '确认删除', content: `确定要删除字典「${record.name}」及其所有数据吗？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => { await deleteDictType(record.id); message.success('删除成功'); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" placeholder="字典名称" style="width: 150px" clearable />
        <Input v-model:value="searchForm.code" placeholder="字典编码" style="width: 150px" clearable />
        <Select v-model:value="searchForm.status" placeholder="状态" style="width: 120px" clearable
          :options="[{label:'启用',value:1},{label:'停用',value:0}]" />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>
      <DataTable :loading="loading" :data="dataSource" :columns="columns" :scroll-x="900"
        :pagination="false" :row-key="(row: any) => row.id" size="small">
      </DataTable>
      <div class="mt-4 flex justify-end">
        <Pagination :page="currentPage" :page-size="pageSize" :item-count="total"
          :page-sizes="[10, 20, 50]" show-size-picker
          @update:page="handlePageChange" @update:page-size="(s: number) => { pageSize = s; currentPage = 1; loadData(); }" />
      </div>
    </div>
  </Page>
</template>
