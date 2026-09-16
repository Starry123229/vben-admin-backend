<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
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
import { $t } from '#/locales';
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

const columns = computed(() => [
  { title: $t('page.dict.dictName'), key: 'name', width: 150 },
  { title: $t('page.dict.dictType'), key: 'code', width: 200 },
  { title: $t('page.common.remark'), key: 'remark', ellipsis: { tooltip: true }, width: 200 },
  {
    title: $t('page.common.status'),
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? $t('page.common.enable') : $t('page.common.disable')) }),
  },
  { title: $t('page.common.createTime'), key: 'createTime', width: 180, render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' },
  {
    title: $t('page.common.action'),
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (row: any) =>
      h('div', { class: 'flex items-center gap-1' }, [
        h(Button, { type: 'primary', text: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => $t('page.common.edit') }),
        h(Button, { type: 'error', text: true, size: 'small', onClick: () => handleDelete(row) }, { default: () => $t('page.common.delete') }),
      ]),
  },
]);

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
    title: $t('page.common.confirmDeleteTitle'), content: $t('page.common.deleteDictConfirm', { name: record.name }),
    positiveText: $t('page.common.confirmOk'), negativeText: $t('page.common.confirmCancel'),
    onPositiveClick: async () => { await deleteDictType(record.id); message.success($t('page.common.deleteSuccess')); loadData(); },
  });
}

function handlePageChange(page: number) { currentPage.value = page; loadData(); }
onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Input v-model:value="searchForm.name" :placeholder="$t('page.dict.dictName')" style="width: 150px" clearable />
        <Input v-model:value="searchForm.code" :placeholder="$t('page.dict.dictType')" style="width: 150px" clearable />
        <Select v-model:value="searchForm.status" :placeholder="$t('page.common.status')" style="width: 120px" clearable
          :options="[{label: $t('page.common.enable'), value: 1}, {label: $t('page.common.disable'), value: 0}]" />
        <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
        <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
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
