<script setup lang="ts">
import type { AboutProps, DescriptionItem } from './about';

import { h } from 'vue';

import { VbenRenderContent } from '@vben-core/shadcn-ui';

import { Page } from '../../components';

interface Props extends AboutProps {}

defineOptions({
  name: 'AboutUI',
});

const props = withDefaults(defineProps<Props>(), {
  authorEmail: '',
  authorName: '',
  authorUrl: '',
  description:
    '是一个现代化开箱即用的中后台解决方案，采用最新的技术栈，包括 Vue 3.0、Vite、TailwindCSS 和 TypeScript 等前沿技术，代码规范严谨，提供丰富的配置选项，旨在为中大型项目的开发提供现成的开箱即用解决方案及丰富的示例，同时，它也是学习和深入前端技术的一个极佳示例。',
  docUrl: '',
  githubUrl: '',
  homepageUrl: '',
  name: 'Vben Admin',
  previewUrl: '',
  title: '关于项目',
});

declare global {
  const __VBEN_ADMIN_METADATA__: {
    authorEmail: string;
    authorName: string;
    authorUrl: string;
    buildTime: string;
    dependencies: Record<string, string>;
    description: string;
    devDependencies: Record<string, string>;
    homepage: string;
    license: string;
    repositoryUrl: string;
    version: string;
  };
}

const renderLink = (href: string, text: string) =>
  h(
    'a',
    { href, target: '_blank', class: 'vben-link' },
    { default: () => text },
  );

const {
  buildTime,
  dependencies = {},
  devDependencies = {},
  license,
  version,
  // vite inject-metadata 插件注入的全局变量
} = __VBEN_ADMIN_METADATA__ || {};

const finalName = props.name;
const finalDescription = props.description;
const finalHomepage = props.homepageUrl;
const finalDocUrl = props.docUrl;
const finalPreviewUrl = props.previewUrl;
const finalGithubUrl = props.githubUrl;
const finalAuthorName = props.authorName;
const finalAuthorEmail = props.authorEmail;
const finalAuthorUrl = props.authorUrl;

const vbenDescriptionItems: DescriptionItem[] = [
  {
    content: version,
    title: '版本号',
  },
  {
    content: license,
    title: '开源许可协议',
  },
  {
    content: buildTime,
    title: '最后构建时间',
  },
];

if (finalHomepage) {
  vbenDescriptionItems.push({
    content: renderLink(finalHomepage, '点击查看'),
    title: '主页',
  });
}

if (finalDocUrl) {
  vbenDescriptionItems.push({
    content: renderLink(finalDocUrl, '点击查看'),
    title: '文档地址',
  });
}

if (finalPreviewUrl) {
  vbenDescriptionItems.push({
    content: renderLink(finalPreviewUrl, '点击查看'),
    title: '预览地址',
  });
}

if (finalGithubUrl) {
  vbenDescriptionItems.push({
    content: renderLink(finalGithubUrl, '点击查看'),
    title: 'Github',
  });
}

if (finalAuthorName || finalAuthorEmail) {
  const authorLinks: ReturnType<typeof h>[] = [];
  if (finalAuthorUrl && finalAuthorName) {
    authorLinks.push(renderLink(finalAuthorUrl, `${finalAuthorName}  `));
  } else if (finalAuthorName) {
    authorLinks.push(h('span', finalAuthorName));
  }
  if (finalAuthorEmail) {
    authorLinks.push(renderLink(`mailto:${finalAuthorEmail}`, finalAuthorEmail));
  }
  vbenDescriptionItems.push({
    content: h('div', authorLinks),
    title: '作者',
  });
}

const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}));

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}));
</script>

<template>
  <Page :title="title">
    <template #description>
      <p class="mt-3 text-sm/6 text-foreground">
        <a
          v-if="finalGithubUrl"
          :href="finalGithubUrl"
          class="vben-link"
          target="_blank"
        >
          {{ finalName }}
        </a>
        <span v-else class="font-semibold">{{ finalName }}</span>
        {{ finalDescription }}
      </p>
    </template>
    <div class="card-box p-5">
      <div>
        <h5 class="text-lg text-foreground">基本信息</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in vbenDescriptionItems" :key="item.title">
            <div class="border-t border-border px-4 py-6 sm:col-span-1 sm:px-0">
              <dt class="text-sm/6 font-medium text-foreground">
                {{ item.title }}
              </dt>
              <dd class="mt-1 text-sm/6 text-foreground sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>

    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg text-foreground">生产环境依赖</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in dependenciesItems" :key="item.title">
            <div class="border-t border-border px-4 py-3 sm:col-span-1 sm:px-0">
              <dt class="text-sm text-foreground">
                {{ item.title }}
              </dt>
              <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>

    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg text-foreground">开发环境依赖</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in devDependenciesItems" :key="item.title">
            <div class="border-t border-border px-4 py-3 sm:col-span-1 sm:px-0">
              <dt class="text-sm text-foreground">
                {{ item.title }}
              </dt>
              <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </Page>
</template>
