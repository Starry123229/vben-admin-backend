<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
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

function confirm(content: string, title: string) {
  return new Promise<boolean>((resolve, reject) => {
    Modal.confirm({
      title,
      content,
      okText: '确定',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => reject(new Error('已取消')),
    });
  });
}

function onEdit(row: SystemDeptApi.SystemDept) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemDeptApi.SystemDept) {
  confirm(`确定删除部门【${row.name}】吗？`, '删除部门')
    .then(() => deleteDept(row.id))
    .then(() => {
      message.success(`删除 ${row.name} 成功`);
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
    <Grid :table-title="'部门管理'">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增部门
        </Button>
      </template>
    </Grid>
  </Page>
</template>
