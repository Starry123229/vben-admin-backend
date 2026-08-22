<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { computed, onMounted, ref } from 'vue';

import { Page, Tree, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, MessagePlugin as message } from 'tdesign-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, getUserList, updateUser } from '#/api/system/user';
import { getDeptList } from '#/api/system/dept';

import { useUserColumns, useUserGridFormSchema } from './data';
import Form from './modules/form.vue';

const deptList = ref<Recordable<any>[]>([]);
const selectedDeptId = ref<string>('');

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useUserColumns(onActionClick, onStatusChange),
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
    DialogPlugin.confirm({
      header: title,
      body: content,
      confirmBtn: '确定',
      cancelBtn: '取消',
      onConfirm: () => resolve(true),
      onClose: () => reject(new Error('已取消')),
    });
  });
}

async function onStatusChange(newStatus: number, row: SystemUserApi.SystemUser) {
  const statusText = newStatus === 1 ? '启用' : '禁用';
  try {
    await confirm(
      `确定将【${row.username}】的状态切换为【${statusText}】吗？`,
      '切换状态',
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
      message.success(`删除 ${row.username} 成功`);
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
        <Button class="mb-2 w-full" @click="clearDept">全部部门</Button>
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
        <Grid :table-title="'用户管理'">
          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              新增用户
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
