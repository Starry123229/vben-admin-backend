<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { createUser, updateUser } from '#/api/system/user';
import { useUserFormSchema } from '../data';

const emits = defineEmits(['success']);
const formData = ref<SystemUserApi.SystemUser>();
const id = ref<number>();

const [Form, formApi] = useVbenForm({
  schema: useUserFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    // ApiSelect(multiple) 会把选中值序列化为字符串，提交前统一转为数字数组
    if (values.roleIds) {
      values.roleIds = (Array.isArray(values.roleIds)
        ? values.roleIds
        : String(values.roleIds).split(',')
      ).map(Number);
    }
    // 编辑且密码留空：不修改密码
    if (id.value && !values.password) {
      delete values.password;
    }
    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
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

const title = computed(() => (id.value ? '编辑用户' : '新增用户'));
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
