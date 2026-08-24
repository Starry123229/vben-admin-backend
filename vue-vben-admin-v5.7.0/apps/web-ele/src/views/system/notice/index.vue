<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import {
  ElButton as Button,
  ElCard as Card,
  ElForm as Form,
  ElFormItem as FormItem,
  ElInput as Input,
  ElMessage as message,
  ElOption as Option,
  ElRadioButton as RadioButton,
  ElRadioGroup as RadioGroup,
  ElSelect as Select,
  ElTag as Tag,
} from 'element-plus';

import {
  broadcastNoticeToRoleApi,
  sendNoticeToUserApi,
} from '#/api/system/notice';
import { getRoleList } from '#/api/system/role';
import { getUserList } from '#/api/system/user';

const userStore = useUserStore();
const sending = ref(false);

const targetOptions = [
  { label: '指定用户', value: 'user' },
  { label: '按角色广播', value: 'role' },
];

const typeOptions = ['info', 'success', 'warning', 'error'];

/** 消息类型对应的 Tag 类型色 */
type TagType = 'danger' | 'info' | 'primary' | 'success' | 'warning';
const typeTagType: Record<string, TagType> = {
  error: 'danger',
  info: 'primary',
  success: 'success',
  warning: 'warning',
};

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
  <Page
    auto-content-height
    title="通知管理"
    description="向用户或角色发送站内通知消息"
  >
    <Card class="mx-4 max-w-[720px]" shadow="never">
      <Form label-position="top" class="max-w-[560px]">
        <FormItem label="发送目标">
          <RadioGroup v-model="formState.targetType">
            <RadioButton
              v-for="opt in targetOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem
          v-if="formState.targetType === 'user'"
          required
          label="接收用户"
        >
          <Select
            v-model="formState.userIds"
            multiple
            filterable
            clearable
            placeholder="选择一个或多个用户"
          >
            <Option
              v-for="opt in userOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </Select>
        </FormItem>

        <FormItem
          v-if="formState.targetType === 'role'"
          required
          label="目标角色"
        >
          <Select
            v-model="formState.roleIds"
            multiple
            filterable
            clearable
            placeholder="选择一个或多个角色（角色下所有用户均会收到）"
          >
            <Option
              v-for="opt in roleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </Select>
        </FormItem>

        <FormItem required label="标题">
          <Input
            v-model="formState.title"
            :maxlength="128"
            show-word-limit
            placeholder="请输入通知标题"
          />
        </FormItem>

        <FormItem label="消息类型">
          <RadioGroup v-model="formState.type">
            <RadioButton v-for="t in typeOptions" :key="t" :value="t">
              <Tag
                :type="typeTagType[t] || 'primary'"
                effect="light"
                class="mr-0 border-none"
              >
                {{ t }}
              </Tag>
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem label="内容">
          <Input
            v-model="formState.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容（可选）"
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