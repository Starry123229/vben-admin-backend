<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Upload,
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

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: () => $t('page.attachment.originalName'), dataIndex: 'originalName', ellipsis: true },
  {
    title: () => $t('page.attachment.fileSize'),
    dataIndex: 'fileSize',
    width: 100,
    customRender: ({ text }: any) => {
      if (!text) return '-';
      return text < 1024
        ? `${text} B`
        : text < 1024 * 1024
          ? `${(text / 1024).toFixed(1)} KB`
          : `${(text / 1024 / 1024).toFixed(1)} MB`;
    },
  },
  { title: () => $t('page.attachment.contentType'), dataIndex: 'contentType', width: 120, ellipsis: true },
  { title: () => $t('page.attachment.fileExt'), dataIndex: 'fileExt', width: 60 },
  { title: () => $t('page.attachment.uploader'), dataIndex: 'uploadUsername', width: 100 },
  { title: () => $t('page.attachment.bizType'), dataIndex: 'bizType', width: 100 },
  {
    title: () => $t('page.attachment.url'),
    dataIndex: 'url',
    ellipsis: true,
    customRender: ({ text }: any) =>
      text ? h('a', { href: text, target: '_blank' }, text) : '-',
  },
  {
    title: () => $t('page.attachment.uploadTime'),
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }: any) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 150,
    customRender: ({ record }: any) => {
      return h(Space, {}, () => [
        h(
          Button,
          {
            size: 'small',
            type: 'link',
            onClick: () => handleViewDetail(record.id),
          },
          () => $t('page.attachment.detail'),
        ),
        h(
          Popconfirm,
          {
            title: $t('page.attachment.confirmDelete'),
            onConfirm: () => handleDelete(record.id),
          },
          () =>
            h(
              Button,
              { size: 'small', type: 'link', danger: true },
              () => $t('page.common.delete'),
            ),
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

function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
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
            allow-clear
            @press-enter="handleSearch"
          />
          <Input
            v-model:value="searchForm.bizType"
            :placeholder="$t('page.attachment.searchBizType')"
            style="width: 150px"
            allow-clear
            @press-enter="handleSearch"
          />
          <Button type="primary" @click="handleSearch">{{ $t('page.common.search') }}</Button>
          <Button @click="handleReset">{{ $t('page.common.reset') }}</Button>
        </Space>
        <Upload
          :before-upload="handleUpload"
          :show-upload-list="false"
          :max-count="1"
        >
          <Button type="primary" :loading="uploading">{{ $t('page.attachment.upload') }}</Button>
        </Upload>
      </div>

      <Table
        :loading="loading"
        :data-source="dataSource"
        :columns="columns"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (t: number) => `${$t('page.common.total')} ${t} ${$t('page.common.records')}`,
          onChange: handlePageChange,
        }"
        :scroll="{ x: 1400 }"
        row-key="id"
        size="small"
      />
    </div>

    <!-- 详情弹窗 -->
    <Modal
      v-model:open="detailModalVisible"
      :title="$t('page.attachment.detailTitle')"
      :footer="null"
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
    </Modal>
  </Page>
</template>
