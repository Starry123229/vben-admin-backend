import type { BasicUserInfo } from '@vben/types';

export interface Props {
  title?: string;
  userInfo: BasicUserInfo | null;
  tabs: {
    label: string;
    value: string;
  }[];
}

export interface FormSchemaItem {
  description: string;
  /** 开关是否禁用（纯展示型状态项建议禁用，避免"可点击但无效果"的误导） */
  disabled?: boolean;
  fieldName: string;
  label: string;
  value: boolean;
}

export interface SettingProps {
  formSchema: FormSchemaItem[];
}
