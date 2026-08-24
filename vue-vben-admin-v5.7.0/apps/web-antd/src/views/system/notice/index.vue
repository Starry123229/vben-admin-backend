<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  RadioButton,
  RadioGroup,
  Select,
  Tag,
} from 'ant-design-vue';

import { getRoleList } from '#/api/system/role';
import { broadcastNoticeToRoleApi, sendNoticeToUserApi } from '#/api/system/notice';
import { getUserList } from '#/api/system/user';

const userStore = useUserStore();
const sending = ref(false);

const targetOptions = [
  { label: '指定用户', value: 'user' },
  { label: '按角色广播', value: 'role' },
];

const typeOptions = ['info', 'success', 'warning', 'error'];

/** 用户下拉选项 */
const userOptions = ref<{ label: string; value: number }[]>([]);
/** 角色下拉选项 */
const roleOptions = ref<{ label: string; value: number }[]>([]);

const formState = reactive({
  content: '',
  roleIds: [] as number[],
  targetType: 'user',
  title: '',
  type: 'info',
  userIds: [] as number[],
});

async function loadOptions() {
  const [users, roles] = await Promise.all([
    getUserList({ page: 1, pageSize: 200 }),
    getRoleList({ page: 1, pageSize: 100 }),
  ]);
  userOptions.value = users.items.map((item) => ({
    label: `${item.username}${item.realName ? `(${item.realName})` : ''}`,
    value: item.id,
  }));
  roleOptions.value = roles.items.map((item) => ({
    label: `${item.name}(${item.code})`,
    value: item.id,
  }));
}

onMounted(() => {
  loadOptions();
});

const canSubmit = computed(() => {
  if (!formState.title.trim()) {
    return false;
  }
  if (
    formState.targetType === 'user' &&
    (!formState.userIds || formState.userIds.length === 0)
  ) {
    return false;
  }
  if (
    formState.targetType === 'role' &&
    (!formState.roleIds || formState.roleIds.length === 0)
  ) {
    return false;
  }
  return true;
});

/** 发送通知：逐个用户 / 逐个角色广播 */
async function handleSend() {
  if (!canSubmit.value) {
    return;
  }
  sending.value = true;
  try {
    let count = 0;
    if (formState.targetType === 'user') {
      for (const userId of formState.userIds) {
        await sendNoticeToUserApi({
          avatar: userStore.userInfo?.avatar || preferences.app.defaultAvatar,
          message: formState.content || undefined,
          title: formState.title.trim(),
          type: formState.type,
          userId,
        });
        count += 1;
      }
      message.success(`已发送通知给 ${count} 位用户`);
    } else {
      for (const roleId of formState.roleIds) {
        const n = await broadcastNoticeToRoleApi({
          avatar: userStore.userInfo?.avatar || preferences.app.defaultAvatar,
          message: formState.content || undefined,
          roleId,
          title: formState.title.trim(),
          type: formState.type,
        });
        count += n ?? 0;
      }
      message.success(`已广播通知，共送达 ${count} 位用户`);
    }
    // 重置表单
    formState.title = '';
    formState.content = '';
    formState.userIds = [];
    formState.roleIds = [];
  } finally {
    sending.value = false;
  }
}
</script>
<template>
  <Page auto-content-height title="通知管理" description="向用户或角色发送站内通知消息">
    <Card class="mx-4 max-w-[720px]">
      <Form layout="vertical" class="max-w-[560px]">
        <FormItem label="发送目标">
          <RadioGroup v-model:value="formState.targetType">
            <RadioButton
              v-for="opt in targetOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem v-if="formState.targetType === 'user'" required label="接收用户">
          <Select
            v-model:value="formState.userIds"
            mode="multiple"
            allow-clear
            placeholder="选择一个或多个用户"
            :options="userOptions"
            option-filter-prop="label"
          />
        </FormItem>

        <FormItem v-if="formState.targetType === 'role'" required label="目标角色">
          <Select
            v-model:value="formState.roleIds"
            mode="multiple"
            allow-clear
            placeholder="选择一个或多个角色（角色下所有用户均会收到）"
            :options="roleOptions"
            option-filter-prop="label"
          />
        </FormItem>

        <FormItem required label="标题">
          <Input
            v-model:value="formState.title"
            placeholder="请输入通知标题"
            :maxlength="128"
            show-count
          />
        </FormItem>

        <FormItem label="消息类型">
          <RadioGroup v-model:value="formState.type">
            <RadioButton v-for="t in typeOptions" :key="t" :value="t">
              <Tag :color="t === 'info' ? 'blue' : t === 'success' ? 'green' : t === 'warning' ? 'orange' : 'red'" class="mr-0 border-none">
                {{ t }}
              </Tag>
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem label="内容">
          <Input.TextArea
            v-model:value="formState.content"
            placeholder="请输入通知内容（可选）"
            :rows="4"
          />
        </FormItem>

        <FormItem>
          <Button
            type="primary"
            :loading="sending"
            :disabled="!canSubmit"
            @click="handleSend"
          >
            发送通知
          </Button>
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>