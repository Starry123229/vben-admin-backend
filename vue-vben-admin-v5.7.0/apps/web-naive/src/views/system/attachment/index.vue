<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  NButton as Button,
  NDataTable as DataTable,
  NInput as Input,
  NModal as Modal,
  NPopconfirm as Popconfirm,
  NSpace as Space,
  NTag as Tag,
  NUpload as Upload,
  useMessage as useNaiveMessage,
} from 'naive-ui';

import { $t } from '#/locales';
import {
  deleteAttachmentApi,
  getAttachmentByIdApi,
  getAttachmentListApi,
  uploadAttachmentApi,
} from '#/api/system/attachment';

defineOptions({ name: 'Attachment' });

const message = useNaiveMessage();
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

function formatFileSize(bytes: number) {
  if (!bytes) return '-';
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: () => $t('page.attachment.originalName'), key: 'originalName', ellipsis: { tooltip: true } },
  {
    title: () => $t('page.attachment.fileSize'),
    key: 'fileSize',
    width: 100,
    render: (row: any) => formatFileSize(row.fileSize),
  },
  { title: () => $t('page.attachment.contentType'), key: 'contentType', width: 120, ellipsis: { tooltip: true } },
  { title: () => $t('page.attachment.fileExt'), key: 'fileExt', width: 60 },
  { title: () => $t('page.attachment.uploader'), key: 'uploadUsername', width: 100 },
  { title: () => $t('page.attachment.bizType'), key: 'bizType', width: 100 },
  {
    title: () => $t('page.attachment.url'),
    key: 'url',
    ellipsis: { tooltip: true },
    render: (row: any) => row.url ? h('a', { href: row.url, target: '_blank' }, row.url) : '-',
  },
  {
    title: () => $t('page.attachment.uploadTime'),
    key: 'createTime',
    width: 180,
    render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 150,
    render: (row: any) => {
      return h(Space, {}, () => [
        h(
          Button,
          { size: 'small', type: 'primary', quaternary: true, onClick: () => handleViewDetail(row.id) },
          { default: () => $t('page.attachment.detail') },
        ),
        h(
          Popconfirm,
          { onPositiveClick: () => handleDelete(row.id) },
          {
            trigger: () => h(Button, { size: 'small', type: 'error', quaternary: true }, { default: () => $t('page.common.delete') }),
            default: () => $t('page.attachment.confirmDelete'),
          },
        ),
      ]);
    },
  },
];

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

async function handleUpload({ file }: { file: { file: File } }) {
  uploading.value = true;
  try {
    await uploadAttachmentApi(file.file);
    message.success($t('page.attachment.uploadSuccess'));
    loadData();
  } catch {
    message.error($t('page.attachment.uploadFailed'));
  } finally {
    uploading.value = false;
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function handlePageSizeChange(size: number) {
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
        <Space>
          <Input
            v-model:value="searchForm.originalName"
            :placeholder="$t('page.attachment.searchFileName')"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          />
          <Input
            v-model:value="searchForm.bizType"
            :placeholder="$t('page.attachment.searchBizType')"
            style="width: 150px"
            clearable
            @keyup.enter="handleSearch"
          />
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        </Space>
        <Upload :show-file-list="false" :max="1" :custom-request="handleUpload">
          <Button type="primary" :loading="uploading">{{ $t('page.attachment.upload') }}</Button>
        </Upload>
      </div>

      <DataTable
        :loading="loading"
        :data="dataSource"
        :columns="columns"
        :scroll-x="1400"
        :pagination="{
          page: currentPage,
          pageSize: pageSize,
          itemCount: total,
          showSizePicker: true,
          pageSizes: [10, 20, 50],
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange,
        }"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </div>

    <!-- 详情弹窗 -->
    <Modal
      v-model:show="detailModalVisible"
      :title="$t('page.attachment.detailTitle')"
      preset="card"
      style="width: 600px"
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
          <a v-if="detailData.url" :href="detailData.url" target="_blank">{{ detailData.url }}</a>
          <span v-else>-</span>
        </div>
        <div>
          <strong>{{ $t('page.attachment.uploadTime') }}:</strong>
          {{ detailData.createTime ? dayjs(detailData.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </div>
      </div>
    </Modal>
  </Page>
</template>
