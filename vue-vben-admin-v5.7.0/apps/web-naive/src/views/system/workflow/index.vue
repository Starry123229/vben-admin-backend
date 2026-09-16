<script lang="ts" setup>
import { h, ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  NButton as Button,
  NDataTable as DataTable,
  NForm as Form,
  NFormItem as FormItem,
  NInput as Input,
  NModal as Modal,
  NPopconfirm as Popconfirm,
  NSelect as Select,
  NSpace as Space,
  NTag as Tag,
  useMessage as useNaiveMessage,
} from 'naive-ui';

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

const message = useNaiveMessage();
const activeTab = ref<'instances' | 'definitions'>('instances');

// 实例列表
const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filterStatus = ref<string | undefined>(undefined);

const statusMap: Record<string, { type: string; label: () => string }> = {
  pending: { type: 'info', label: () => $t('page.workflow.pending') },
  approved: { type: 'success', label: () => $t('page.workflow.approved') },
  rejected: { type: 'error', label: () => $t('page.workflow.rejected') },
  cancelled: { type: 'default', label: () => $t('page.workflow.cancelled') },
};

const instanceColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: () => $t('page.workflow.title'), key: 'title', ellipsis: { tooltip: true } },
  { title: () => $t('page.workflow.applicant'), key: 'applicantName', width: 100 },
  { title: () => $t('page.workflow.workflowName'), key: 'workflowName', width: 120 },
  {
    title: () => $t('page.workflow.currentStep'),
    key: 'step',
    width: 80,
    render: (row: any) => `${row.currentStep + 1}/${row.totalSteps}`,
  },
  {
    title: () => $t('page.workflow.status'),
    key: 'status',
    width: 100,
    render: (row: any) => {
      const s = statusMap[row.status] || { type: 'default', label: () => row.status };
      return h(Tag, { type: s.type as any }, { default: () => s.label() });
    },
  },
  {
    title: () => $t('page.auditLog.createTime'),
    key: 'createTime',
    width: 180,
    render: (row: any) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 220,
    render: (row: any) => {
      const actions: any[] = [
        h(Button, { size: 'small', type: 'primary', quaternary: true, onClick: () => showTasksModal(row) }, { default: () => $t('page.workflow.tasks') }),
      ];
      if (row.status === 'pending') {
        actions.push(
          h(Button, { size: 'small', type: 'success', quaternary: true, onClick: () => showApproveModal(row, 'approve') }, { default: () => $t('page.workflow.approve') }),
          h(Button, { size: 'small', type: 'error', quaternary: true, onClick: () => showApproveModal(row, 'reject') }, { default: () => $t('page.workflow.reject') }),
          h(Popconfirm, { onPositiveClick: () => handleCancel(row.id) }, {
            trigger: () => h(Button, { size: 'small', type: 'default', quaternary: true }, { default: () => $t('page.workflow.cancel') }),
            default: () => $t('page.workflow.confirmCancel'),
          }),
        );
      }
      return h(Space, {}, { default: () => actions });
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
  { title: 'ID', key: 'id', width: 80 },
  { title: () => $t('page.workflow.name'), key: 'name', ellipsis: { tooltip: true } },
  { title: () => $t('page.workflow.code'), key: 'code', width: 120 },
  { title: () => $t('page.workflow.type'), key: 'type', width: 100 },
  { title: () => $t('page.workflow.remark'), key: 'remark', ellipsis: { tooltip: true } },
  {
    title: () => $t('page.workflow.status'),
    key: 'status',
    width: 80,
    render: (row: any) => h(Tag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => (row.status === 1 ? $t('page.workflow.active') : $t('page.workflow.disabled')) }),
  },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 250,
    render: (row: any) => {
      return h(Space, {}, {
        default: () => [
          h(Button, { size: 'small', type: 'primary', quaternary: true, onClick: () => showStartModal(row) }, { default: () => $t('page.workflow.start') }),
          h(Button, { size: 'small', type: 'info', quaternary: true, onClick: () => showDefModal(row) }, { default: () => $t('page.common.edit') }),
          h(Popconfirm, { onPositiveClick: () => handleDeleteDef(row.id) }, {
            trigger: () => h(Button, { size: 'small', type: 'error', quaternary: true }, { default: () => $t('page.common.delete') }),
            default: () => $t('page.workflow.confirmDeleteDef'),
          }),
        ],
      });
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
  await approveWorkflowApi(currentInstance.value.id, approveAction.value, approveComment.value);
  message.success(approveAction.value === 'approve' ? $t('page.workflow.approved') : $t('page.workflow.rejected'));
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

const taskColumns = [
  { title: () => $t('page.workflow.currentStep'), key: 'step', width: 60 },
  { title: () => $t('page.workflow.approver'), key: 'approverName', width: 100 },
  {
    title: () => $t('page.common.action'),
    key: 'action',
    width: 80,
    render: (row: any) => h(Tag, { type: row.action === 'approve' ? 'success' : 'error' }, { default: () => row.action }),
  },
  { title: () => $t('page.workflow.comment'), key: 'comment', ellipsis: { tooltip: true } },
  {
    title: () => $t('page.workflow.approveTime'),
    key: 'approveTime',
    width: 180,
    render: (row: any) => row.approveTime ? dayjs(row.approveTime).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
];

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
    defForm.value = { id: undefined, name: '', code: '', type: 'approval', definition: '', status: 1, remark: '' };
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

function handlePageChange(page: number) {
  if (activeTab.value === 'instances') {
    currentPage.value = page;
  } else {
    defCurrentPage.value = page;
  }
  loadData();
}

function handlePageSizeChange(size: number) {
  if (activeTab.value === 'instances') {
    pageSize.value = size;
    currentPage.value = 1;
  } else {
    defPageSize.value = size;
    defCurrentPage.value = 1;
  }
  loadData();
}

function switchTab(tab: 'instances' | 'definitions') {
  activeTab.value = tab;
  if (tab === 'instances') {
    currentPage.value = 1;
  } else {
    defCurrentPage.value = 1;
  }
  loadData();
}

function handleFilterChange() {
  currentPage.value = 1;
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
            @click="switchTab('instances')"
          >
            {{ $t('page.workflow.instances') }}
          </Button>
          <Button
            :type="activeTab === 'definitions' ? 'primary' : 'default'"
            @click="switchTab('definitions')"
          >
            {{ $t('page.workflow.definitions') }}
          </Button>
        </Space>
        <Select
          v-if="activeTab === 'instances'"
          v-model:value="filterStatus"
          :placeholder="$t('page.workflow.filterStatus')"
          style="width: 150px"
          clearable
          :options="[
            { label: $t('page.workflow.pending'), value: 'pending' },
            { label: $t('page.workflow.approved'), value: 'approved' },
            { label: $t('page.workflow.rejected'), value: 'rejected' },
            { label: $t('page.workflow.cancelled'), value: 'cancelled' },
          ]"
          @update:value="handleFilterChange"
        />
        <Button
          v-if="activeTab === 'definitions'"
          type="primary"
          @click="showDefModal()"
        >
          {{ $t('page.workflow.newWorkflow') }}
        </Button>
      </div>

      <DataTable
        v-if="activeTab === 'instances'"
        :loading="loading"
        :data="dataSource"
        :columns="instanceColumns"
        :scroll-x="1000"
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

      <DataTable
        v-else
        :loading="defLoading"
        :data="defDataSource"
        :columns="defColumns"
        :pagination="{
          page: defCurrentPage,
          pageSize: defPageSize,
          itemCount: defTotal,
          showSizePicker: true,
          pageSizes: [10, 20, 50],
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange,
        }"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </div>

    <!-- 审批弹窗 -->
    <Modal
      v-model:show="approveModalVisible"
      :title="approveAction === 'approve' ? $t('page.workflow.approve') : $t('page.workflow.reject')"
      preset="dialog"
      :positive-text="$t('page.common.confirmOk')"
      :negative-text="$t('page.common.confirmCancel')"
      @positive-click="handleApprove"
    >
      <Input
        v-model:value="approveComment"
        type="textarea"
        :placeholder="$t('page.workflow.comment')"
        :rows="4"
      />
    </Modal>

    <!-- 审批记录弹窗 -->
    <Modal
      v-model:show="tasksModalVisible"
      :title="`${$t('page.workflow.tasks')} - #${currentInstance?.id || ''}`"
      preset="card"
      style="width: 700px"
    >
      <DataTable
        :loading="tasksLoading"
        :data="tasksData"
        :columns="taskColumns"
        :pagination="false"
        :row-key="(row: any) => row.id"
        size="small"
      />
    </Modal>

    <!-- 发起审批弹窗 -->
    <Modal
      v-model:show="startModalVisible"
      :title="`${$t('page.workflow.start')}: ${currentWorkflow?.name || ''}`"
      preset="dialog"
      :positive-text="$t('page.common.confirmOk')"
      :negative-text="$t('page.common.confirmCancel')"
      @positive-click="handleStart"
    >
      <div class="mb-2">
        <label class="mb-1 block">{{ $t('page.workflow.title') }}</label>
        <Input v-model:value="startForm.title" :placeholder="$t('page.workflow.enterTitle')" />
      </div>
      <div>
        <label class="mb-1 block">{{ $t('page.workflow.content') }}</label>
        <Input
          v-model:value="startForm.content"
          type="textarea"
          :placeholder="$t('page.workflow.enterContent')"
          :rows="4"
        />
      </div>
    </Modal>

    <!-- 流程定义弹窗 -->
    <Modal
      v-model:show="defModalVisible"
      :title="defModalTitle"
      preset="dialog"
      style="width: 600px"
      :positive-text="$t('page.common.confirmOk')"
      :negative-text="$t('page.common.confirmCancel')"
      @positive-click="handleDefSubmit"
    >
      <Form label-placement="top">
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
          <Input
            v-model:value="defForm.definition"
            type="textarea"
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
          <Input v-model:value="defForm.remark" type="textarea" :rows="2" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
