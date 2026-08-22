import type { Component } from 'vue';

interface AboutProps {
  /** 作者邮箱 */
  authorEmail?: string;
  /** 作者名称 */
  authorName?: string;
  /** 作者主页 URL */
  authorUrl?: string;
  /** 描述信息 */
  description?: string;
  /** 文档地址 */
  docUrl?: string;
  /** GitHub 地址 */
  githubUrl?: string;
  /** 主页地址 */
  homepageUrl?: string;
  /** 项目名称 */
  name?: string;
  /** 预览地址 */
  previewUrl?: string;
  /** 页面标题 */
  title?: string;
}

interface DescriptionItem {
  content: Component | string;
  title: string;
}

export type { AboutProps, DescriptionItem };
