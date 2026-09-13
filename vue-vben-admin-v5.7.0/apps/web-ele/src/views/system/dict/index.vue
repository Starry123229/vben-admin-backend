<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  ElButton as Button,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox as MessageBox,
  ElOption as Option,
  ElPagination as Pagination,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';
import { deleteDictType, getDictTypeList } from '#/api/system/dict';

defineOptions({ name: 'DictType' });
const router = useRouter();
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ name: '', code: '', status: undefined as number | undefined });

async function loadData() {
  loading.value = true;
  try {
    const data = await getDictTypeList({ page: currentPage.value, pageSize: pageSize.value, ...searchForm.value });
    dataSource.value = data.items;
    total.value = data.total;
  } finally { loading.value = false; }
}

function handleSearch() { currentPage.value = 1; loadData(); }
function handleReset() { searchForm.value = { name: '', code: '', status: undefined }; currentPage.value = 1; loadData(); }
function handleEdit(record: any) { router.push(`/system/dict/data/${record.id}`); }

async function handleDelete(record: any) {
  try {
    await MessageBox.confirm(`确定要删除字典「${record.name}」及其所有数据吗？`, '确认删除', { type: 'warning' });
    await deleteDictType(record.id);
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
        <Input v-model="searchForm.name" placeholder="字典名称" style="width: 150px" clearable />
        <Input v-model="searchForm.code" placeholder="字典编码" style="width: 150px" clearable />
        <Select v-model="searchForm.status" placeholder="状态" style="width: 120px" clearable>
          <Option label="启用" :value="1" />
          <Option label="停用" :value="0" />
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>
      <Table v-loading="loading" :data="dataSource" border size="small" style="width: 100%">
        <TableColumn prop="name" label="字典名称" width="150" />
        <TableColumn prop="code" label="字典编码" width="200" />
        <TableColumn prop="remark" label="备注" show-overflow-tooltip min-width="200" />
        <TableColumn label="状态" width="80">
          <template #default="{ row }">
            <Tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</template>
        </TableColumn>
        <TableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleEdit(row)">编辑</Button>
            <Button type="danger" link size="small" @click="handleDelete(row)">删除</Button>
          </template>
        </TableColumn>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination
          :current-page="currentPage" :page-size="pageSize" :total="total"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange" @size-change="handlePageSizeChange"
        />
      </div>
    </div>
  </Page>
</template>
