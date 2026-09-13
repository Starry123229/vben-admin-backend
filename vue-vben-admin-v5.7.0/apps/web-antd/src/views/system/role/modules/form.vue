<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Tree as ATree } from 'ant-design-vue';

import {
  assignRoleMenus,
  createRole,
  getRoleMenus,
  updateRole,
} from '#/api/system/role';
import { getMenuTree } from '#/api/system/menu';
import { useRoleFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<SystemRoleApi.SystemRole>();
const id = ref<number>();
const menuTree = ref<any[]>([]);
/** 勾选中的叶子菜单 id（antd Tree 受控） */
const checkedMenuIds = ref<number[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useRoleFormSchema(),
  showDefaultActions: false,
  commonConfig: { componentProps: { class: 'w-full' } },
});

function translateMenuTree(nodes: any[]): any[] {
  return nodes.map((node) => {
    const translated = {
      ...node,
      label:
        node.meta?.title && typeof node.meta.title === 'string'
          ? $t(node.meta.title as any)
          : node.name,
    };
    if (Array.isArray(node.children) && node.children.length > 0) {
      translated.children = translateMenuTree(node.children);
    }
    return translated;
  });
}

const labeledMenuTree = computed(() => translateMenuTree(menuTree.value));

/** 所有含子节点的父菜单 id 集合（回显时仅需勾选叶子，父级由 Tree 级联推导） */
const parentIdSet = computed(() => {
  const set = new Set<number>();
  const walk = (nodes: any[]) => {
    nodes.forEach((n) => {
      if (Array.isArray(n.children) && n.children.length > 0) {
        set.add(n.id);
        walk(n.children);
      }
    });
  };
  walk(menuTree.value);
  return set;
});

/** 勾选变化：checked + halfChecked(父级) 一起提交，保证父菜单可见 */
function onCheck(checked: any, info: any) {
  const keys = Array.isArray(checked) ? checked : (checked?.checked ?? []);
  const half = info?.halfCheckedKeys ?? [];
  checkedMenuIds.value = [...keys];
  formApi.setValues({ menuIds: [...keys, ...half] });
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const menuIds = Array.isArray(values.menuIds) ? values.menuIds : [];
    delete values.menuIds;
    delete values.id;
    drawerApi.lock();
    try {
      if (id.value) {
        await updateRole(id.value, values);
      } else {
        id.value = (await createRole(values)) as number;
      }
      await assignRoleMenus(id.value, { menuIds });
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();
      checkedMenuIds.value = [];
      if (data?.id) {
        formData.value = data;
        id.value = data.id;
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
      if (menuTree.value.length === 0) {
        try {
          menuTree.value = await getMenuTree();
        } catch (error) {
          console.error('加载菜单树失败:', error);
        }
      }
      await nextTick();
      if (data?.id) {
        formApi.setValues(data);
        try {
          const menus = (await getRoleMenus(data.id)) || [];
          // 只回显叶子节点，父级勾选态交给 Tree 级联计算（避免父 id 污染全选状态）
          const leaves = menus.filter((m: number) => !parentIdSet.value.has(m));
          checkedMenuIds.value = [...leaves];
          formApi.setValues({ menuIds: menus });
        } catch (error) {
          console.error('加载角色菜单失败:', error);
        }
      }
    }
  },
});

const title = computed(() => (id.value ? '编辑角色' : '新增角色'));
</script>
<template>
  <Drawer :title="title">
    <Form>
      <template #menuIds>
        <div class="max-h-80 w-full overflow-auto rounded-md border p-2">
          <ATree
            v-if="labeledMenuTree.length > 0"
            :tree-data="labeledMenuTree"
            :field-names="{ title: 'label', key: 'id', children: 'children' }"
            :checked-keys="checkedMenuIds"
            checkable
            default-expand-all
            @check="onCheck"
          />
        </div>
      </template>
    </Form>
  </Drawer>
</template>