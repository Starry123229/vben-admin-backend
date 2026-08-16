<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { createDept, updateDept } from '#/api/system/dept';
import { useDeptFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<SystemDeptApi.SystemDept>();
const id = ref<number>();

const [Form, formApi] = useVbenForm({
  schema: useDeptFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (values.pid == null || values.pid === '') {
      values.pid = 0;
    }
    delete values.id;
    drawerApi.lock();
    (id.value ? updateDept(id.value, values) : createDept(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemDeptApi.SystemDept>();
      formApi.resetForm();
      if (data?.id) {
        formData.value = data;
        id.value = data.id;
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

const title = computed(() => (id.value ? '编辑部门' : '新增部门'));
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
