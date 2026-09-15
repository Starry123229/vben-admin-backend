<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

import { Page } from '@vben/common-ui';

import {
  ElButton as Button,
  ElDialog as Dialog,
  ElForm as Form,
  ElFormItem as FormItem,
  ElInput as Input,
  ElMessage as message,
  ElMessageBox,
  ElOption as Option,
  ElSelect as Select,
  ElTable as Table,
  ElTableColumn as TableColumn,
  ElTag as Tag,
} from 'element-plus';

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

function getStatusTagType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info',
  };
  return map[status] || 'info';
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: $t('page.workflow.pending'),
    approved: $t('page.workflow.approved'),
    rejected: $t('page.workflow.rejected'),
    cancelled: $t('page.workflow.cancelled'),
  };
  return map[status] || status;
}

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
  try {
    await ElMessageBox.confirm($t('page.workflow.confirmCancel'), $t('page.common.confirmDeleteTitle'), {
      type: 'warning',
    });
  } catch {
    return;
  }
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
  try {
    await ElMessageBox.confirm($t('page.workflow.confirmDeleteDef'), $t('page.common.confirmDeleteTitle'), {
      type: 'warning',
    });
  } catch {
    return;
  }
  await deleteWorkflowApi(id);
  message.success($t('page.common.deleteSuccess'));
  loadData();
}

// 定义列表
const defLoading = ref(false);
const defDataSource = ref<any[]>([]);
const defTotal = ref(0);
const defCurrentPage = ref(1);
const defPageSize = ref(10);

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

function handleSizeChange(size: number) {
  if (activeTab.value === 'instances') {
    pageSize.value = size;
    currentPage.value = 1;
  } else {
    defPageSize.value = size;
    defCurrentPage.value = 1;
  }
  loadData();
}

function handleFilterChange() {
  currentPage.value = 1;
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

loadData();
</script>

<template>
  <Page auto-content-height>
    <div class="overflow-hidden">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex gap-2">
          <Button :type="activeTab === 'instances' ? 'primary' : 'default'" @click="switchTab('instances')">
            {{ $t('page.workflow.instances') }}
          </Button>
          <Button :type="activeTab === 'definitions' ? 'primary' : 'default'" @click="switchTab('definitions')">
            {{ $t('page.workflow.definitions') }}
          </Button>
        </div>
        <Select
          v-if="activeTab === 'instances'"
          v-model="filterStatus"
          :placeholder="$t('page.workflow.filterStatus')"
          style="width: 150px"
          clearable
          @change="handleFilterChange"
        >
          <Option :label="$t('page.workflow.pending')" value="pending" />
          <Option :label="$t('page.workflow.approved')" value="approved" />
          <Option :label="$t('page.workflow.rejected')" value="rejected" />
          <Option :label="$t('page.workflow.cancelled')" value="cancelled" />
        </Select>
        <Button
          v-if="activeTab === 'definitions'"
          type="primary"
          @click="showDefModal()"
        >
          {{ $t('page.workflow.newWorkflow') }}
        </Button>
      </div>

      <!-- 实例列表 -->
      <template v-if="activeTab === 'instances'">
        <Table v-loading="loading" :data="dataSource" style="width: 100%" row-key="id" size="small">
          <TableColumn prop="id" label="ID" width="80" />
          <TableColumn prop="title" :label="$t('page.workflow.title')" show-overflow-tooltip />
          <TableColumn prop="applicantName" :label="$t('page.workflow.applicant')" width="100" />
          <TableColumn prop="workflowName" :label="$t('page.workflow.workflowName')" width="120" />
          <TableColumn :label="$t('page.workflow.currentStep')" width="80">
            <template #default="{ row }">
              {{ row.currentStep + 1 }}/{{ row.totalSteps }}
            </template>
          </TableColumn>
          <TableColumn :label="$t('page.workflow.status')" width="100">
            <template #default="{ row }">
              <Tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</Tag>
            </template>
          </TableColumn>
          <TableColumn :label="$t('page.auditLog.createTime')" width="180">
            <template #default="{ row }">
              {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
          </TableColumn>
          <TableColumn :label="$t('page.common.action')" width="220">
            <template #default="{ row }">
              <Button type="primary" link size="small" @click="showTasksModal(row)">{{ $t('page.workflow.tasks') }}</Button>
              <template v-if="row.status === 'pending'">
                <Button type="success" link size="small" @click="showApproveModal(row, 'approve')">{{ $t('page.workflow.approve') }}</Button>
                <Button type="danger" link size="small" @click="showApproveModal(row, 'reject')">{{ $t('page.workflow.reject') }}</Button>
                <Button link size="small" @click="handleCancel(row.id)">{{ $t('page.workflow.cancel') }}</Button>
              </template>
            </template>
          </TableColumn>
        </Table>
        <div class="mt-4 flex items-center justify-between">
          <span>{{ $t('page.common.total') }} {{ total }} {{ $t('page.common.records') }}</span>
          <div class="flex items-center gap-2">
            <Select :model-value="pageSize" style="width: 120px" @update:model-value="handleSizeChange">
              <Option label="10条/页" :value="10" />
              <Option label="20条/页" :value="20" />
              <Option label="50条/页" :value="50" />
            </Select>
            <div class="flex items-center gap-1">
              <Button :disabled="currentPage <= 1" size="small" @click="handlePageChange(currentPage - 1)">上一页</Button>
              <span>{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
              <Button :disabled="currentPage >= Math.ceil(total / pageSize)" size="small" @click="handlePageChange(currentPage + 1)">下一页</Button>
            </div>
          </div>
        </div>
      </template>

      <!-- 定义列表 -->
      <template v-else>
        <Table v-loading="defLoading" :data="defDataSource" style="width: 100%" row-key="id" size="small">
          <TableColumn prop="id" label="ID" width="80" />
          <TableColumn prop="name" :label="$t('page.workflow.name')" show-overflow-tooltip />
          <TableColumn prop="code" :label="$t('page.workflow.code')" width="120" />
          <TableColumn prop="type" :label="$t('page.workflow.type')" width="100" />
          <TableColumn prop="remark" :label="$t('page.workflow.remark')" show-overflow-tooltip />
          <TableColumn :label="$t('page.workflow.status')" width="80">
            <template #default="{ row }">
              <Tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? $t('page.workflow.active') : $t('page.workflow.disabled') }}
              </Tag>
            </template>
          </TableColumn>
          <TableColumn :label="$t('page.common.action')" width="250">
            <template #default="{ row }">
              <Button type="primary" link size="small" @click="showStartModal(row)">{{ $t('page.workflow.start') }}</Button>
              <Button type="primary" link size="small" @click="showDefModal(row)">{{ $t('page.common.edit') }}</Button>
              <Button type="danger" link size="small" @click="handleDeleteDef(row.id)">{{ $t('page.common.delete') }}</Button>
            </template>
          </TableColumn>
        </Table>
        <div class="mt-4 flex items-center justify-between">
          <span>{{ $t('page.common.total') }} {{ defTotal }} {{ $t('page.common.records') }}</span>
          <div class="flex items-center gap-2">
            <Select :model-value="defPageSize" style="width: 120px" @update:model-value="handleSizeChange">
              <Option label="10条/页" :value="10" />
              <Option label="20条/页" :value="20" />
              <Option label="50条/页" :value="50" />
            </Select>
            <div class="flex items-center gap-1">
              <Button :disabled="defCurrentPage <= 1" size="small" @click="handlePageChange(defCurrentPage - 1)">上一页</Button>
              <span>{{ defCurrentPage }} / {{ Math.ceil(defTotal / defPageSize) || 1 }}</span>
              <Button :disabled="defCurrentPage >= Math.ceil(defTotal / defPageSize)" size="small" @click="handlePageChange(defCurrentPage + 1)">下一页</Button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 审批弹窗 -->
    <Dialog
      v-model="approveModalVisible"
      :title="approveAction === 'approve' ? $t('page.workflow.approve') : $t('page.workflow.reject')"
    >
      <Input
        v-model="approveComment"
        type="textarea"
        :placeholder="$t('page.workflow.comment')"
        :rows="4"
      />
      <template #footer>
        <Button @click="approveModalVisible = false">取消</Button>
        <Button type="primary" @click="handleApprove">确认</Button>
      </template>
    </Dialog>

    <!-- 审批记录弹窗 -->
    <Dialog
      v-model="tasksModalVisible"
      :title="`${$t('page.workflow.tasks')} - #${currentInstance?.id || ''}`"
      width="700px"
    >
      <Table v-loading="tasksLoading" :data="tasksData" style="width: 100%" row-key="id" size="small">
        <TableColumn prop="step" :label="$t('page.workflow.currentStep')" width="60" />
        <TableColumn prop="approverName" :label="$t('page.workflow.approver')" width="100" />
        <TableColumn :label="$t('page.common.action')" width="80">
          <template #default="{ row }">
            <Tag :type="row.action === 'approve' ? 'success' : 'danger'">{{ row.action }}</Tag>
          </template>
        </TableColumn>
        <TableColumn prop="comment" :label="$t('page.workflow.comment')" show-overflow-tooltip />
        <TableColumn :label="$t('page.workflow.approveTime')" width="180">
          <template #default="{ row }">
            {{ row.approveTime ? dayjs(row.approveTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </template>
        </TableColumn>
      </Table>
    </Dialog>

    <!-- 发起审批弹窗 -->
    <Dialog
      v-model="startModalVisible"
      :title="`${$t('page.workflow.start')}: ${currentWorkflow?.name || ''}`"
    >
      <div class="mb-2">
        <label class="mb-1 block">{{ $t('page.workflow.title') }}</label>
        <Input v-model="startForm.title" :placeholder="$t('page.workflow.enterTitle')" />
      </div>
      <div>
        <label class="mb-1 block">{{ $t('page.workflow.content') }}</label>
        <Input
          v-model="startForm.content"
          type="textarea"
          :placeholder="$t('page.workflow.enterContent')"
          :rows="4"
        />
      </div>
      <template #footer>
        <Button @click="startModalVisible = false">取消</Button>
        <Button type="primary" @click="handleStart">确认</Button>
      </template>
    </Dialog>

    <!-- 流程定义弹窗 -->
    <Dialog
      v-model="defModalVisible"
      :title="defModalTitle"
      width="600px"
    >
      <Form label-position="top">
        <FormItem :label="$t('page.workflow.name')" required>
          <Input v-model="defForm.name" :placeholder="$t('page.workflow.namePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.workflow.code')" required>
          <Input v-model="defForm.code" :placeholder="$t('page.workflow.codePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('page.workflow.type')">
          <Select v-model="defForm.type" style="width: 100%">
            <Option :label="$t('page.workflow.typeApproval')" value="approval" />
            <Option :label="$t('page.workflow.typeNotify')" value="notify" />
          </Select>
        </FormItem>
        <FormItem :label="$t('page.workflow.definitionLabel')">
          <Input
            v-model="defForm.definition"
            type="textarea"
            placeholder='[{"step":0,"name":"Leader","approverId":1}]'
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('page.workflow.status')">
          <Select v-model="defForm.status" style="width: 100%">
            <Option :label="$t('page.workflow.active')" :value="1" />
            <Option :label="$t('page.workflow.disabled')" :value="0" />
          </Select>
        </FormItem>
        <FormItem :label="$t('page.workflow.remark')">
          <Input v-model="defForm.remark" type="textarea" :rows="2" />
        </FormItem>
      </Form>
      <template #footer>
        <Button @click="defModalVisible = false">取消</Button>
        <Button type="primary" @click="handleDefSubmit">确认</Button>
      </template>
    </Dialog>
  </Page>
</template>
