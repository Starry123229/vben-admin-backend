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
  ElRadioGroup as RadioGroup,
  ElRadioButton as RadioButton,
  ElSelect as Select,
  ElTag as Tag,
} from 'element-plus';

import { $t } from '#/locales';
import { getRoleList } from '#/api/system/role';
import { broadcastNoticeToRoleApi, sendNoticeToUserApi } from '#/api/system/notice';
import { getUserList } from '#/api/system/user';

const userStore = useUserStore();
const sending = ref(false);

const targetOptions = computed(() => [
  { label: $t('page.notice.targetUser'), value: 'user' },
  { label: $t('page.notice.targetRole'), value: 'role' },
]);

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
      message.success(
        $t('page.notice.sendSuccess', { count, type: $t('page.notice.targetUser') }),
      );
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
      message.success(
        $t('page.notice.broadcastSuccess', { count }),
      );
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

function getTagType(t: string) {
  if (t === 'info') return 'primary';
  if (t === 'success') return 'success';
  if (t === 'warning') return 'warning';
  return 'danger';
}
</script>

<template>
  <Page
    auto-content-height
    :title="$t('page.notice.title')"
    :description="$t('page.notice.description')"
  >
    <Card class="mx-4 max-w-[720px]">
      <Form label-position="top" class="max-w-[560px]">
        <FormItem :label="$t('page.notice.targetType')">
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
          :label="$t('page.notice.selectUser')"
        >
          <Select
            v-model="formState.userIds"
            multiple
            clearable
            filterable
            :placeholder="$t('page.notice.selectUserPlaceholder')"
            style="width: 100%"
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
          :label="$t('page.notice.selectRole')"
        >
          <Select
            v-model="formState.roleIds"
            multiple
            clearable
            filterable
            :placeholder="$t('page.notice.selectRolePlaceholder')"
            style="width: 100%"
          >
            <Option
              v-for="opt in roleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </Select>
        </FormItem>

        <FormItem required :label="$t('page.notice.noticeTitle')">
          <Input
            v-model="formState.title"
            :placeholder="$t('page.notice.enterTitle')"
            :maxlength="128"
            show-word-limit
          />
        </FormItem>

        <FormItem :label="$t('page.notice.noticeType')">
          <RadioGroup v-model="formState.type">
            <RadioButton v-for="t in typeOptions" :key="t" :value="t">
              <Tag :type="getTagType(t)" class="mr-0 border-none">
                {{ $t(`page.notice.noticeInfo${t.charAt(0).toUpperCase() + t.slice(1)}`) }}
              </Tag>
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem :label="$t('page.notice.noticeContent')">
          <Input
            v-model="formState.content"
            type="textarea"
            :placeholder="$t('page.notice.enterContent')"
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
            {{ $t('page.notice.sendNotice') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>
