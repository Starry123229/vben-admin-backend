<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer, useVbenForm } from '@vben/common-ui';

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

const [Form, formApi] = useVbenForm({
  schema: useRoleFormSchema(),
  showDefaultActions: false,
  commonConfig: { componentProps: { class: 'w-full' } },
});

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
      if (data) {
        formApi.setValues(data);
        try {
          const menus = await getRoleMenus(data.id);
          formApi.setValues({ menuIds: menus || [] });
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
      <template #menuIds="slotProps">
        <Tree
          v-bind="slotProps"
          multiple
          :tree-data="menuTree"
          value-field="id"
          label-field="meta.title"
          children-field="children"
          :default-expanded-level="2"
        />
      </template>
    </Form>
  </Drawer>
</template>
