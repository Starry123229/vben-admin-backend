<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { computed, onMounted, ref } from 'vue';

import { Page, Tree, useVbenDrawer } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useAccess } from '@vben/access';
import { $t } from '#/locales';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, exportUserList, getUserList, updateUser } from '#/api/system/user';
import { getDeptList } from '#/api/system/dept';

import { useUserColumns, useUserGridFormSchema } from './data';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const deptList = ref<Recordable<any>[]>([]);
const selectedDeptId = ref<string>('');

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridFormSchema(),
    showCollapseButton: false,
    submitOnChange: true,
  },
  gridOptions: {
    columns: useUserColumns(onActionClick, onStatusChange, getDeptName),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const params: Recordable<any> = {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          };
          if (selectedDeptId.value) {
            params.deptId = Number(selectedDeptId.value);
          }
          return await getUserList(params);
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function confirm(content: string, title: string) {
  return new Promise<boolean>((resolve, reject) => {
    Modal.confirm({
      title,
      content,
      okText: $t('page.common.confirmOk'),
      cancelText: $t('page.common.confirmCancel'),
      onOk: () => resolve(true),
      onCancel: () => reject(new Error($t('page.common.cancelled'))),
    });
  });
}

async function onStatusChange(newStatus: number, row: SystemUserApi.SystemUser) {
  const statusText = newStatus === 1 ? $t('page.common.enable') : $t('page.common.disable');
  try {
    await confirm(
      $t('page.common.switchStatusConfirm', { name: row.username, status: statusText }),
      $t('page.common.switchStatus'),
    );
    await updateUser(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  // 删除确认已由操作列 CellOperation 的 Popconfirm 完成，此处直接删除，避免双重确认
  deleteUser(row.id)
    .then(() => {
      message.success($t('page.common.deleteSuccessMsg', { name: row.username }));
      onRefresh();
    })
    .catch(() => {});
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

async function onExport() {
  try {
    const gridData = gridApi.grid?.data || [];
    const params: Recordable<any> = {};
    if (selectedDeptId.value) {
      params.deptId = Number(selectedDeptId.value);
    }
    await exportUserList(params);
    message.success($t('page.common.exportSuccess'));
  } catch {
    message.error($t('page.common.exportFailed'));
  }
}

function buildDeptTree(list: Recordable<any>[]) {
  const map = new Map<number, any>();
  const roots: any[] = [];
  list.forEach((d) => map.set(d.id, { ...d, children: [] }));
  list.forEach((d) => {
    const node = map.get(d.id);
    if (d.pid && d.pid !== 0 && map.has(d.pid)) {
      map.get(d.pid).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const deptTree = computed(() => buildDeptTree(deptList.value));

function getDeptName(deptId: any): string {
  const dept = deptList.value.find((d) => String(d.id) === String(deptId));
  return dept?.name || '';
}

function selectDept(item: any) {
  const id = item?.value?.id ?? item?.id;
  selectedDeptId.value = id == null ? '' : String(id);
  gridApi.query();
}

function clearDept() {
  selectedDeptId.value = '';
  gridApi.query();
}

onMounted(async () => {
  try {
    deptList.value = await getDeptList();
  } catch (error) {
    console.error('加载部门失败:', error);
  }
});
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <div class="flex size-full">
      <div class="w-1/6 border-r p-2">
        <Button class="mb-2 w-full" @click="clearDept">{{ $t('page.common.allDept') }}</Button>
        <Tree
          :tree-data="deptTree"
          label-field="name"
          value-field="id"
          children-field="children"
          :default-expanded-level="2"
          @select="selectDept"
        />
      </div>
      <div class="w-5/6 pl-4">
        <Grid :table-title="$t('page.user.title')">
          <template #toolbar-tools>
            <Button v-if="hasAccessByCodes(['AC_100010'])" type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t('page.common.addUser') }}
            </Button>
            <Button v-if="hasAccessByCodes(['AC_1000000'])" class="ml-2" @click="onExport">
              <Download class="size-5" />
              {{ $t('page.common.exportExcel') }}
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
