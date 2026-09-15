<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  ElButton as Button,
  ElDialog as Dialog,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElUpload as Upload,
} from 'element-plus';

import { $t } from '#/locales';
import {
  deleteAttachmentApi,
  getAttachmentByIdApi,
  getAttachmentListApi,
  uploadAttachmentApi,
} from '#/api/system/attachment';

defineOptions({ name: 'Attachment' });

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = ref({ originalName: '', bizType: '' });
const uploading = ref(false);

// 详情弹窗
const detailModalVisible = ref(false);
const detailData = ref<any>({});

function formatFileSize(text: number) {
  if (!text) return '-';
  return text < 1024
    ? `${text} B`
    : text < 1024 * 1024
      ? `${(text / 1024).toFixed(1)} KB`
      : `${(text / 1024 / 1024).toFixed(1)} MB`;
}

async function loadData() {
  loading.value = true;
  try {
    const data = await getAttachmentListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value,
    });
    dataSource.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handleReset() {
  searchForm.value = { originalName: '', bizType: '' };
  currentPage.value = 1;
  loadData();
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm($t('page.attachment.confirmDelete'), $t('page.common.confirmDeleteTitle'), {
      type: 'warning',
    });
  } catch {
    return;
  }
  await deleteAttachmentApi(id);
  message.success($t('page.common.deleteSuccess'));
  loadData();
}

async function handleViewDetail(id: number) {
  try {
    detailData.value = await getAttachmentByIdApi(id);
    detailModalVisible.value = true;
  } catch {
    message.error($t('page.attachment.loadDetailFailed'));
  }
}

async function handleUpload(file: File) {
  uploading.value = true;
  try {
    await uploadAttachmentApi(file);
    message.success($t('page.attachment.uploadSuccess'));
    loadData();
  } catch {
    message.error($t('page.attachment.uploadFailed'));
  } finally {
    uploading.value = false;
  }
  return false;
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
}

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <Input
            v-model="searchForm.originalName"
            :placeholder="$t('page.attachment.searchFileName')"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          />
          <Input
            v-model="searchForm.bizType"
            :placeholder="$t('page.attachment.searchBizType')"
            style="width: 150px"
            clearable
            @keyup.enter="handleSearch"
          />
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        </div>
        <Upload
          :before-upload="handleUpload"
          :show-file-list="false"
          :limit="1"
        >
          <Button type="primary" :loading="uploading">{{ $t('page.attachment.upload') }}</Button>
        </Upload>
      </div>

      <Table
        v-loading="loading"
        :data="dataSource"
        style="width: 100%"
        row-key="id"
        size="small"
      >
        <TableColumn prop="id" label="ID" width="80" />
        <TableColumn prop="originalName" :label="$t('page.attachment.originalName')" show-overflow-tooltip />
        <TableColumn :label="$t('page.attachment.fileSize')" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </TableColumn>
        <TableColumn prop="contentType" :label="$t('page.attachment.contentType')" width="120" show-overflow-tooltip />
        <TableColumn prop="fileExt" :label="$t('page.attachment.fileExt')" width="60" />
        <TableColumn prop="uploadUsername" :label="$t('page.attachment.uploader')" width="100" />
        <TableColumn prop="bizType" :label="$t('page.attachment.bizType')" width="100" />
        <TableColumn :label="$t('page.attachment.url')" show-overflow-tooltip>
          <template #default="{ row }">
            <a v-if="row.url" :href="row.url" target="_blank">{{ row.url }}</a>
            <span v-else>-</span>
          </template>
        </TableColumn>
        <TableColumn :label="$t('page.attachment.uploadTime')" width="180">
          <template #default="{ row }">
            {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </template>
        </TableColumn>
        <TableColumn :label="$t('page.common.action')" width="150">
          <template #default="{ row }">
            <Button type="primary" link size="small" @click="handleViewDetail(row.id)">
              {{ $t('page.attachment.detail') }}
            </Button>
            <Button type="danger" link size="small" @click="handleDelete(row.id)">
              {{ $t('page.common.delete') }}
            </Button>
          </template>
        </TableColumn>
      </Table>

      <div class="mt-4 flex items-center justify-between">
        <span>{{ $t('page.common.total') }} {{ total }} {{ $t('page.common.records') }}</span>
        <div class="flex items-center gap-2">
          <el-select
            :model-value="pageSize"
            style="width: 120px"
            @update:model-value="handleSizeChange"
          >
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
          </el-select>
          <div class="flex items-center gap-1">
            <Button :disabled="currentPage <= 1" size="small" @click="handlePageChange(currentPage - 1)">上一页</Button>
            <span>{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
            <Button :disabled="currentPage >= Math.ceil(total / pageSize)" size="small" @click="handlePageChange(currentPage + 1)">下一页</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Dialog
      v-model="detailModalVisible"
      :title="$t('page.attachment.detailTitle')"
      width="600px"
    >
      <div class="space-y-2">
        <div><strong>ID:</strong> {{ detailData.id }}</div>
        <div><strong>{{ $t('page.attachment.originalName') }}:</strong> {{ detailData.originalName }}</div>
        <div><strong>{{ $t('page.attachment.fileSize') }}:</strong> {{ detailData.fileSize }} bytes</div>
        <div><strong>{{ $t('page.attachment.contentType') }}:</strong> {{ detailData.contentType }}</div>
        <div><strong>{{ $t('page.attachment.fileExt') }}:</strong> {{ detailData.fileExt }}</div>
        <div><strong>{{ $t('page.attachment.md5Hash') }}:</strong> {{ detailData.md5Hash }}</div>
        <div><strong>{{ $t('page.attachment.uploader') }}:</strong> {{ detailData.uploadUsername }}</div>
        <div><strong>{{ $t('page.attachment.bizType') }}:</strong> {{ detailData.bizType || '-' }}</div>
        <div><strong>{{ $t('page.attachment.bizId') }}:</strong> {{ detailData.bizId || '-' }}</div>
        <div>
          <strong>{{ $t('page.attachment.url') }}:</strong>
          <a v-if="detailData.url" :href="detailData.url" target="_blank">
            {{ detailData.url }}
          </a>
          <span v-else>-</span>
        </div>
        <div>
          <strong>{{ $t('page.attachment.uploadTime') }}:</strong>
          {{
            detailData.createTime
              ? dayjs(detailData.createTime).format('YYYY-MM-DD HH:mm:ss')
              : '-'
          }}
        </div>
      </div>
    </Dialog>
  </Page>
</template>
