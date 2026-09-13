<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { NButton as Button } from 'naive-ui';
import { getServerInfo } from '#/api/system/monitor';

defineOptions({ name: 'SystemMonitor' });
const loading = ref(false);
const serverInfo = ref<any>({});

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(ms: number) {
  if (!ms) return '-';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${days}天 ${hours}小时 ${mins}分钟`;
}

async function loadData() {
  loading.value = true;
  try { serverInfo.value = await getServerInfo(); }
  finally { loading.value = false; }
}

onMounted(() => loadData());
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4 p-4">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">系统监控</h2>
        <Button type="primary" :loading="loading" @click="loadData">刷新数据</Button>
      </div>

      <!-- JVM 信息 -->
      <div class="rounded-lg border bg-card p-5">
        <h3 class="mb-4 text-base font-semibold">JVM 信息</h3>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">Java版本</span>
            <span class="font-medium">{{ serverInfo.jvm?.javaVersion || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">JVM名称</span>
            <span class="font-medium">{{ serverInfo.jvm?.jvmName || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">运行时间</span>
            <span class="font-medium">{{ formatTime(serverInfo.jvm?.uptime) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">可用CPU</span>
            <span class="font-medium">{{ serverInfo.sys?.processors || '-' }} 核</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">已用内存</span>
            <span class="font-medium text-orange-500">{{ formatBytes(serverInfo.jvm?.usedMemory) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">剩余内存</span>
            <span class="font-medium text-green-500">{{ formatBytes(serverInfo.jvm?.freeMemory) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">总内存</span>
            <span class="font-medium">{{ formatBytes(serverInfo.jvm?.totalMemory) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">最大内存</span>
            <span class="font-medium">{{ formatBytes(serverInfo.jvm?.maxMemory) }}</span>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="rounded-lg border bg-card p-5">
        <h3 class="mb-4 text-base font-semibold">服务器信息</h3>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">操作系统</span>
            <span class="font-medium">{{ serverInfo.sys?.osName || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">系统架构</span>
            <span class="font-medium">{{ serverInfo.sys?.osArch || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">系统版本</span>
            <span class="font-medium">{{ serverInfo.sys?.osVersion || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-foreground/50 text-xs">工作目录</span>
            <span class="font-medium">{{ serverInfo.sys?.userDir || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- CPU/内存（oshi） -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-lg border bg-card p-5">
          <h3 class="mb-4 text-base font-semibold">CPU 信息</h3>
          <div v-if="serverInfo.cpu && !serverInfo.cpu.error" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">名称</span>
              <span class="font-medium">{{ serverInfo.cpu?.name || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">物理核</span>
              <span class="font-medium">{{ serverInfo.cpu?.physicalCores || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">逻辑核</span>
              <span class="font-medium">{{ serverInfo.cpu?.logicalCores || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">系统负载</span>
              <span class="font-medium text-orange-500">{{ serverInfo.cpu?.systemLoad || 0 }}%</span>
            </div>
          </div>
          <div v-else class="py-8 text-center text-foreground/40">CPU信息不可用</div>
        </div>
        <div class="rounded-lg border bg-card p-5">
          <h3 class="mb-4 text-base font-semibold">内存信息</h3>
          <div v-if="serverInfo.memory && !serverInfo.memory.error" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">总内存</span>
              <span class="font-medium">{{ formatBytes(serverInfo.memory?.total) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">已用</span>
              <span class="font-medium text-orange-500">{{ formatBytes(serverInfo.memory?.used) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">可用</span>
              <span class="font-medium text-green-500">{{ formatBytes(serverInfo.memory?.available) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-foreground/50 text-sm">使用率</span>
              <span class="font-medium text-orange-500">{{ serverInfo.memory?.usageRate || 0 }}%</span>
            </div>
          </div>
          <div v-else class="py-8 text-center text-foreground/40">内存信息不可用</div>
        </div>
      </div>
    </div>
  </Page>
</template>
