<script setup lang="ts">
import type { Props } from './types';

import { ref } from 'vue';

import { preferences } from '@vben-core/preferences';
import {
  Card,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  VbenAvatar,
} from '@vben-core/shadcn-ui';

import { $t } from '@vben/locales';

import { Page } from '../../components';

defineOptions({
  name: 'ProfileUI',
});

withDefaults(defineProps<Props>(), {
  title: '关于项目',
  tabs: () => [],
});

const emit = defineEmits<{
  avatarChange: [file: File];
}>();

const tabsValue = defineModel<string>('modelValue');

const fileInputRef = ref<HTMLInputElement | null>(null);

function pickAvatar() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    emit('avatarChange', file);
  }
  // 允许再次选择同一文件
  input.value = '';
}
</script>
<template>
  <Page auto-content-height>
    <div class="flex size-full">
      <Card class="w-1/6 flex-none">
        <div class="mt-4 flex-col-center h-40 gap-4">
          <!-- 点击头像更换：hover 蒙层提示，选择文件后由应用层负责上传 -->
          <div
            class="group relative cursor-pointer rounded-full"
            :title="$t('profile.changeAvatar')"
            @click="pickAvatar"
          >
            <VbenAvatar
              :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
              class="size-20"
            />
            <div
              class="absolute inset-0 hidden items-center justify-center rounded-full bg-black/45 text-xs text-white group-hover:flex"
            >
              {{ $t('profile.changeAvatar') }}
            </div>
          </div>
          <input
            ref="fileInputRef"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            type="file"
            @change="onFileChange"
          />
          <span class="text-lg font-semibold">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-sm text-foreground/80">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
        <Separator class="my-4" />
        <Tabs v-model="tabsValue" orientation="vertical" class="m-4">
          <TabsList class="grid w-full grid-cols-1 bg-card">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="h-12 justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      <Card class="ml-4 w-5/6 flex-auto p-8">
        <slot name="content"></slot>
      </Card>
    </div>
  </Page>
</template>
