<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton as Button, ElMessage as message, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import { deleteDept, getDeptList } from '#/api/system/dept';

import { useDeptColumns, useDeptGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDeptGridFormSchema(),
    showCollapseButton: false,
    submitOnChange: true,
  },
  gridOptions: {
    columns: useDeptColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await getDeptList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return { items: res, total: res.length };
        },
      },
    },
    rowConfig: { keyField: 'id' },
    pagerConfig: { enabled: false },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemDeptApi.SystemDept>,
});

function onActionClick(e: OnActionClickParams<SystemDeptApi.SystemDept>) {
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

function onEdit(row: SystemDeptApi.SystemDept) {
  formDrawerApi.setData(row).open();
}

function confirm(content: string, title: string) {
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: $t('page.common.confirmOk'),
    cancelButtonText: $t('page.common.confirmCancel'),
    type: 'warning',
  });
}

async function onDelete(row: SystemDeptApi.SystemDept) {
  // ElPopconfirm 无法在 vxe 单元格内渲染，删除确认改由页面层 ElMessageBox 完成
  try {
    await confirm($t('page.common.confirmDelete') + ' ' + row.name + '?', $t('page.common.confirmDeleteTitle'));
  } catch {
    return; // 用户取消
  }
  deleteDept(row.id)
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
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('page.dept.title')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('page.common.addDept') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
