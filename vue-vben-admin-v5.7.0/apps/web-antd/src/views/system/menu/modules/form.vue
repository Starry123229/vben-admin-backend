<script lang="ts" setup>
import type { SystemMenuApi } from '#/api/system/menu';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { createMenu, getMenuTree, updateMenu } from '#/api/system/menu';
import { useMenuFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<SystemMenuApi.SystemMenu>();
const id = ref<number>();
const menuTree = ref<any[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useMenuFormSchema(),
  showDefaultActions: false,
  commonConfig: { componentProps: { class: 'w-full' } },
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const meta: Recordable<any> = {};
    if (values.title) {
      meta.title = values.title;
    }
    if (values.icon) {
      meta.icon = values.icon;
    }
    const payload: Recordable<any> = {
      type: values.type,
      name: values.name,
      pid: values.pid == null || values.pid === '' ? 0 : Number(values.pid),
      path: values.path || '',
      component: values.component || '',
      authCode: values.authCode || '',
      redirect: values.redirect || '',
      status: values.status ?? 1,
      sort: values.sort ?? 0,
      meta: JSON.stringify(meta),
    };
    if (id.value) {
      payload.id = id.value;
    }
    drawerApi.lock();
    (id.value ? updateMenu(id.value, payload) : createMenu(payload))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemMenuApi.SystemMenu>();
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
        let parsed: any = {};
        if (typeof data.meta === 'string' && data.meta) {
          try {
            parsed = JSON.parse(data.meta);
          } catch {
            parsed = {};
          }
        } else if (data.meta) {
          parsed = data.meta;
        }
        formApi.setValues({
          type: data.type,
          name: data.name,
          pid: data.pid,
          title: parsed.title,
          icon: parsed.icon,
          path: data.path,
          component: data.component,
          authCode: data.authCode,
          redirect: data.redirect,
          status: data.status ?? 1,
          sort: data.sort ?? 0,
        });
      }
    }
  },
});

const title = computed(() => (id.value ? '编辑菜单' : '新增菜单'));
</script>
<template>
  <Drawer :title="title">
    <Form>
      <template #pid="slotProps">
        <Tree
          v-bind="slotProps"
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
