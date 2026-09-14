<script lang="ts" setup>
import type { SystemMenuApi } from '#/api/system/menu';

import type { Recordable } from '@vben/types';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { createMenu, getMenuTree, updateMenu } from '#/api/system/menu';
import { useMenuFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<SystemMenuApi.SystemMenu>();
const id = ref<number>();
const menuTree = ref<any[]>([]);
/** 编辑前的原始 meta：保存时合并，避免丢失 affixTab 等表单未展示的字段 */
const editingMeta = ref<Recordable<any>>({});

/** 上级菜单树的标题若为 i18n key（如 page.dashboard.title）则翻译为当前语言展示 */
function translateTitles(nodes: any[]): any[] {
  return nodes.map((node) => {
    const next = { ...node };
    const title = next?.meta?.title;
    if (typeof title === 'string' && /^[\w-]+(\.[\w-]+)+$/.test(title)) {
      const translated = $t(title);
      if (translated && translated !== title) {
        next.meta = { ...next.meta, title: translated };
      }
    }
    if (next.children?.length) {
      next.children = translateTitles(next.children);
    }
    return next;
  });
}

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
    const meta: Recordable<any> = { ...(editingMeta.value || {}) };
    if (values.title) {
      meta.title = values.title;
    }
    if (values.icon) {
      meta.icon = values.icon;
    } else {
      delete meta.icon;
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
        editingMeta.value = {};
      }
      if (menuTree.value.length === 0) {
        try {
          menuTree.value = translateTitles(await getMenuTree());
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
        editingMeta.value = parsed;
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

const title = computed(() => (id.value ? $t('page.common.editMenu') : $t('page.common.addMenu')));
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
