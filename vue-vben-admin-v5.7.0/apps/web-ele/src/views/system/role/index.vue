<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { ElButton as Button, ElMessage as message } from 'element-plus';
import { ElMessageBox } from 'element-plus';

import { useAccess } from '@vben/access';
import { $t } from '#/locales';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, exportRoleList, getRoleList, updateRole } from '#/api/system/role';

import { useRoleColumns, useRoleGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useRoleGridFormSchema(),
    showCollapseButton: false,
    submitOnChange: true,
  },
  gridOptions: {
    columns: useRoleColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
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
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
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
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: $t('page.common.confirmOk'),
    cancelButtonText: $t('page.common.confirmCancel'),
    type: 'warning',
  })
    .then(() => true)
    .catch(() => {
      throw new Error($t('page.common.cancelled'));
    });
}

async function onStatusChange(newStatus: number, row: SystemRoleApi.SystemRole) {
  const statusText = newStatus === 1 ? $t('page.common.enable') : $t('page.common.disable');
  try {
    await confirm(
      $t('page.common.switchStatusConfirm', { name: row.name, status: statusText }),
      $t('page.common.switchStatus'),
    );
    await updateRole(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}

async function onDelete(row: SystemRoleApi.SystemRole) {
  // ElPopconfirm 无法在 vxe 单元格内渲染，删除确认改由页面层 ElMessageBox 完成
  try {
    await confirm($t('page.common.confirmDelete') + ' ' + row.name + '?', $t('page.common.confirmDeleteTitle'));
  } catch {
    return; // 用户取消
  }
  deleteRole(row.id)
    .then(() => {
      message.success($t('page.common.deleteSuccessMsg', { name: row.name }));
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
    await exportRoleList();
    message.success($t('page.common.exportSuccess'));
  } catch {
    message.error($t('page.common.exportFailed'));
  }
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('page.role.title')">
      <template #toolbar-tools>
        <Button v-if="hasAccessByCodes(['AC_1000002'])" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('page.common.addRole') }}
        </Button>
        <Button v-if="hasAccessByCodes(['AC_1000001'])" class="ml-2" @click="onExport">
          <Download class="size-5" />
          {{ $t('page.common.exportExcel') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
