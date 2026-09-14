<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
} from 'antdv-next';

import { $t } from '#/locales';
import {
  approveWorkflowApi,
  cancelWorkflowApi,
  createWorkflowApi,
  deleteWorkflowApi,
  getWorkflowInstancesApi,
  getWorkflowListApi,
  getWorkflowTasksApi,
  startWorkflowApi,
  updateWorkflowApi,
} from '#/api/system/workflow';

defineOptions({ name: 'Workflow' });

const activeTab = ref<'instances' | 'definitions'>('instances');

// 实例列表
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filterStatus = ref<string | undefined>(undefined);

const instanceColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: () => $t('page.workflow.title'), dataIndex: 'title', ellipsis: true },
  { title: () => $t('page.workflow.applicant'), dataIndex: 'applicantName', width: 100 },
  { title: () => $t('page.workflow.workflowName'), dataIndex: 'workflowName', width: 120 },
  {
    title: () => $t('page.workflow.currentStep'),
    key: 'step',
    width: 80,
    customRender: ({ record }: any) =>
      `${record.currentStep + 1}/${record.totalSteps}`,
  },
  {
    title: () => $t('page.workflow.status'),
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }: any) => {
      const map: Record<string, { color: string; label: string }> = {
        pending: { color: 'processing', label: $t('page.workflow.pending') },
        approved: { color: 'green', label: $t('page.workflow.approved') },
        rejected: { color: 'red', label: $t('page.workflow.rejected') },
        cancelled: { color: 'default', label: $t('page.workflow.cancelled') },
      };
      const s = map[text] || { color: 'default', label: text };
      return h(Tag, { color: s.color }, () => s.label);
    },
  },
  {
    title: () => $t('page.auditLog.createTime'),
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }: any) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 220,
    customRender: ({ record }: any) => {
      const actions: any[] = [
        h(
          Button,
          {
            size: 'small',
            type: 'link',
            onClick: () => showTasksModal(record),
          },
          () => $t('page.workflow.tasks'),
        ),
      ];
      if (record.status === 'pending') {
        actions.push(
          h(
            Button,
            {
              size: 'small',
              type: 'link',
              onClick: () => showApproveModal(record, 'approve'),
            },
            () => $t('page.workflow.approve'),
          ),
          h(
            Button,
            {
              size: 'small',
              type: 'link',
              danger: true,
              onClick: () => showApproveModal(record, 'reject'),
            },
            () => $t('page.workflow.reject'),
          ),
          h(
            Popconfirm,
            {
              title: $t('page.workflow.confirmCancel'),
              onConfirm: () => handleCancel(record.id),
            },
            () =>
              h(
                Button,
                { size: 'small', type: 'link' },
                () => $t('page.workflow.cancel'),
              ),
          ),
        );
      }
      return h(Space, {}, () => actions);
    },
  },
];

// 定义列表
const defLoading = ref(false);
const defDataSource = ref<any[]>([]);
const defTotal = ref(0);
const defCurrentPage = ref(1);
const defPageSize = ref(10);

const defColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: () => $t('page.workflow.name'), dataIndex: 'name', ellipsis: true },
  { title: () => $t('page.workflow.code'), dataIndex: 'code', width: 120 },
  { title: () => $t('page.workflow.type'), dataIndex: 'type', width: 100 },
  { title: () => $t('page.workflow.remark'), dataIndex: 'remark', ellipsis: true },
  {
    title: () => $t('page.workflow.status'),
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }: any) =>
      h(
        Tag,
        { color: text === 1 ? 'green' : 'red' },
        () => (text === 1 ? $t('page.workflow.active') : $t('page.workflow.disabled')),
      ),
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 250,
    customRender: ({ record }: any) => {
      return h(Space, {}, () => [
        h(
          Button,
          {
            size: 'small',
            type: 'link',
            onClick: () => showStartModal(record),
          },
          () => $t('page.workflow.start'),
        ),
        h(
          Button,
          {
            size: 'small',
            type: 'link',
            onClick: () => showDefModal(record),
          },
          () => $t('page.common.edit'),
        ),
        h(
          Popconfirm,
          {
            title: $t('page.workflow.confirmDeleteDef'),
            onConfirm: () => handleDeleteDef(record.id),
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

// 审批弹窗
const approveModalVisible = ref(false);
const approveAction = ref<'approve' | 'reject'>('approve');
const approveComment = ref('');
const currentInstance = ref<any>(null);

function showApproveModal(record: any, action: 'approve' | 'reject') {
  currentInstance.value = record;
  approveAction.value = action;
  approveComment.value = '';
  approveModalVisible.value = true;
}

async function handleApprove() {
  await approveWorkflowApi(
    currentInstance.value.id,
    approveAction.value,
    approveComment.value,
  );
  message.success(
    approveAction.value === 'approve' ? $t('page.workflow.approved') : $t('page.workflow.rejected'),
  );
  approveModalVisible.value = false;
  loadData();
}

// 审批记录弹窗
const tasksModalVisible = ref(false);
const tasksLoading = ref(false);
const tasksData = ref<any[]>([]);

async function showTasksModal(record: any) {
  currentInstance.value = record;
  tasksModalVisible.value = true;
  tasksLoading.value = true;
  try {
    tasksData.value = await getWorkflowTasksApi(record.id);
  } finally {
    tasksLoading.value = false;
  }
}

// 发起审批弹窗
const startModalVisible = ref(false);
const startForm = ref({ title: '', content: '' });
const currentWorkflow = ref<any>(null);

function showStartModal(record: any) {
  currentWorkflow.value = record;
  startForm.value = { title: '', content: '' };
  startModalVisible.value = true;
}

async function handleStart() {
  if (!startForm.value.title.trim()) {
    message.warning($t('page.workflow.enterTitle'));
    return;
  }
  await startWorkflowApi({
    workflowId: currentWorkflow.value.id,
    title: startForm.value.title,
    content: startForm.value.content,
  });
  message.success($t('page.workflow.started'));
  startModalVisible.value = false;
  activeTab.value = 'instances';
  loadData();
}

async function handleCancel(id: number) {
  await cancelWorkflowApi(id);
  message.success($t('page.workflow.cancelled'));
  loadData();
}

// 流程定义弹窗（新建/编辑）
const defModalVisible = ref(false);
const defModalTitle = ref('');
const defForm = ref({
  id: undefined as number | undefined,
  name: '',
  code: '',
  type: 'approval',
  definition: '',
  status: 1,
  remark: '',
});

function showDefModal(record?: any) {
  if (record) {
    defModalTitle.value = $t('page.workflow.editWorkflow');
    defForm.value = { ...record };
  } else {
    defModalTitle.value = $t('page.workflow.newWorkflow');
    defForm.value = {
      id: undefined,
      name: '',
      code: '',
      type: 'approval',
      definition: '',
      status: 1,
      remark: '',
    };
  }
  defModalVisible.value = true;
}

async function handleDefSubmit() {
  if (!defForm.value.name.trim()) {
    message.warning($t('page.workflow.enterName'));
    return;
  }
  if (!defForm.value.code.trim()) {
    message.warning($t('page.workflow.enterCode'));
    return;
  }
  if (defForm.value.id) {
    await updateWorkflowApi(defForm.value.id, defForm.value);
    message.success($t('page.common.saveSuccess'));
  } else {
    await createWorkflowApi(defForm.value);
    message.success($t('page.common.operationSuccess'));
  }
  defModalVisible.value = false;
  loadData();
}

async function handleDeleteDef(id: number) {
  await deleteWorkflowApi(id);
  message.success($t('page.common.deleteSuccess'));
  loadData();
}

async function loadData() {
  if (activeTab.value === 'instances') {
    loading.value = true;
    try {
      const data = await getWorkflowInstancesApi({
        page: currentPage.value,
        pageSize: pageSize.value,
        status: filterStatus.value,
      });
      dataSource.value = data.items;
      total.value = data.total;
    } finally {
      loading.value = false;
    }
  } else {
    defLoading.value = true;
    try {
      const data = await getWorkflowListApi({
        page: defCurrentPage.value,
        pageSize: defPageSize.value,
      });
      defDataSource.value = data.items;
      defTotal.value = data.total;
    } finally {
      defLoading.value = false;
    }
  }
}

function handlePageChange(page: number, size: number) {
  if (activeTab.value === 'instances') {
    currentPage.value = page;
    pageSize.value = size;
  } else {
    defCurrentPage.value = page;
    defPageSize.value = size;
  }
  loadData();
}

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center justify-between">
        <Space>
          <Button
            :type="activeTab === 'instances' ? 'primary' : 'default'"
            @click="
              activeTab = 'instances';
              currentPage = 1;
              loadData();
            "
          >
            {{ $t('page.workflow.instances') }}
          </Button>
          <Button
            :type="activeTab === 'definitions' ? 'primary' : 'default'"
            @click="
              activeTab = 'definitions';
              defCurrentPage = 1;
              loadData();
            "
          >
            {{ $t('page.workflow.definitions') }}
          </Button>
        </Space>
        <Space v-if="activeTab === 'instances'">
          <Select
            v-model:value="filterStatus"
            :placeholder="$t('page.workflow.filterStatus')"
            style="width: 150px"
            allow-clear
            :options="[
              { label: $t('page.workflow.pending'), value: 'pending' },
              { label: $t('page.workflow.approved'), value: 'approved' },
              { label: $t('page.workflow.rejected'), value: 'rejected' },
              { label: $t('page.workflow.cancelled'), value: 'cancelled' },
            ]"
            @change="
              () => {
                currentPage = 1;
                loadData();
              }
            "
          />
        </Space>
        <Button
          v-if="activeTab === 'definitions'"
          type="primary"
          @click="showDefModal()"
        >
          {{ $t('page.workflow.newWorkflow') }}
        </Button>
      </div>

      <Table
        v-if="activeTab === 'instances'"
        :loading="loading"
        :data-source="dataSource"
        :columns="instanceColumns"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (t: number) => `${$t('page.common.total')} ${t} ${$t('page.common.records')}`,
          onChange: handlePageChange,
        }"
        :scroll="{ x: 1000 }"
        row-key="id"
        size="small"
      />

      <Table
        v-else
        :loading="defLoading"
        :data-source="defDataSource"
        :columns="defColumns"
        :pagination="{
          current: defCurrentPage,
          pageSize: defPageSize,
          total: defTotal,
          showSizeChanger: true,
          showTotal: (t: number) => `${$t('page.common.total')} ${t} ${$t('page.common.records')}`,
          onChange: handlePageChange,
        }"
        row-key="id"
        size="small"
      />
    </div>

    <!-- 审批弹窗 -->
    <Modal
      v-model:open="approveModalVisible"
      :title="approveAction === 'approve' ? $t('page.workflow.approve') : $t('page.workflow.reject')"
      @ok="handleApprove"
    >
      <Textarea
        v-model:value="approveComment"
        :placeholder="$t('page.workflow.comment')"
        :rows="4"
      />
    </Modal>

    <!-- 审批记录弹窗 -->
    <Modal
      v-model:open="tasksModalVisible"
      :title="`${$t('page.workflow.tasks')} - #${currentInstance?.id || ''}`"
      :footer="null"
      width="700px"
    >
      <Table
        :loading="tasksLoading"
        :data-source="tasksData"
        :pagination="false"
        :columns="[
          { title: $t('page.workflow.currentStep'), dataIndex: 'step', width: 60 },
          { title: $t('page.workflow.approver'), dataIndex: 'approverName', width: 100 },
          {
            title: $t('page.common.action'),
            dataIndex: 'action',
            width: 80,
            customRender: ({ text }: any) =>
              h(
                Tag,
                { color: text === 'approve' ? 'green' : 'red' },
                () => text,
              ),
          },
          { title: $t('page.workflow.comment'), dataIndex: 'comment', ellipsis: true },
          {
            title: $t('page.workflow.approveTime'),
            dataIndex: 'approveTime',
            width: 180,
            customRender: ({ text }: any) =>
              text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
          },
        ]"
        row-key="id"
        size="small"
      />
    </Modal>

    <!-- 发起审批弹窗 -->
    <Modal
      v-model:open="startModalVisible"
      :title="`${$t('page.workflow.start')}: ${currentWorkflow?.name || ''}`"
      @ok="handleStart"
    >
      <div class="mb-2">
        <label class="mb-1 block">{{ $t('page.workflow.title') }}</label>
        <Input v-model:value="startForm.title" :placeholder="$t('page.workflow.enterTitle')" />
      </div>
      <div>
        <label class="mb-1 block">{{ $t('page.workflow.content') }}</label>
        <Textarea
          v-model:value="startForm.content"
          :placeholder="$t('page.workflow.enterContent')"
          :rows="4"
        />
      </div>
    </Modal>

    <!-- 流程定义弹窗 -->
    <Modal
      v-model:open="defModalVisible"
      :title="defModalTitle"
      width="600px"
      @ok="handleDefSubmit"
    >
      <Form layout="vertical">
        <FormItem :label="$t('page.workflow.name')" required>
          <Input v-model:value="defForm.name" :placeholder="$t('page.workflow.namePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.workflow.code')" required>
          <Input v-model:value="defForm.code" :placeholder="$t('page.workflow.codePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.workflow.type')">
          <Select
            v-model:value="defForm.type"
            :options="[
              { label: $t('page.workflow.typeApproval'), value: 'approval' },
              { label: $t('page.workflow.typeNotify'), value: 'notify' },
            ]"
          />
        </FormItem>
        <FormItem :label="$t('page.workflow.definitionLabel')">
          <Textarea
            v-model:value="defForm.definition"
            placeholder='[{"step":0,"name":"Leader","approverId":1}]'
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('page.workflow.status')">
          <Select
            v-model:value="defForm.status"
            :options="[
              { label: $t('page.workflow.active'), value: 1 },
              { label: $t('page.workflow.disabled'), value: 0 },
            ]"
          />
        </FormItem>
        <FormItem :label="$t('page.workflow.remark')">
          <Textarea v-model:value="defForm.remark" :rows="2" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
