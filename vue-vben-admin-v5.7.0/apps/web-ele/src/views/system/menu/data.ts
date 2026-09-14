import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import { SystemMenuApi } from '#/api/system/menu';

import { $t } from '#/locales';

export function useMenuFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'type',
      label: $t('page.menu.type'),
      defaultValue: 'menu',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: SystemMenuApi.MenuTypeOptions,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.menu.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'pid',
      label: $t('page.menu.pid'),
      formItemClass: 'items-start',
      modelPropName: 'modelValue',
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('page.menu.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'path',
      label: $t('page.menu.path'),
      help: '以 / 开头，如 /system/user',
      dependencies: {
        show: (values) =>
          ['catalog', 'embedded', 'link', 'menu'].includes(values.type),
        triggerFields: ['type'],
      },
    },
    {
      component: 'Input',
      fieldName: 'component',
      label: $t('page.menu.component'),
      help: '如 /system/user/index 或 BasicLayout',
      dependencies: {
        show: (values) =>
          ['catalog', 'embedded', 'menu'].includes(values.type),
        triggerFields: ['type'],
      },
    },
    {
      component: 'Input',
      fieldName: 'authCode',
      label: $t('page.menu.authCode'),
      help: '按钮型菜单必填，如 system:user:create',
      dependencies: {
        show: (values) => values.type === 'button',
        triggerFields: ['type'],
      },
    },
    {
      component: 'IconPicker',
      fieldName: 'icon',
      label: $t('page.menu.icon'),
      dependencies: {
        show: (values) =>
          ['catalog', 'embedded', 'link', 'menu'].includes(values.type),
        triggerFields: ['type'],
      },
    },
    {
      component: 'Input',
      fieldName: 'redirect',
      label: $t('page.menu.path'),
      help: $t('page.menu.path'),
      dependencies: {
        show: (values) => values.type === 'catalog',
        triggerFields: ['type'],
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('page.menu.sort'),
      defaultValue: 0,
      componentProps: { class: 'w-full' },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('page.common.status'),
      defaultValue: 1,
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: $t('page.common.enable'), value: 1 },
          { label: $t('page.common.disable'), value: 0 },
        ],
      },
    },
  ];
}

export function useMenuColumns(
  onActionClick: OnActionClickFn<SystemMenuApi.SystemMenu>,
): VxeTableGridColumns<SystemMenuApi.SystemMenu> {
  return [
    {
      field: 'meta.title',
      title: $t('page.menu.name'),
      treeNode: true,
      fixed: 'left',
      width: 240,
      slots: { default: 'title' },
    },
    {
      field: 'type',
      title: $t('page.menu.type'),
      width: 100,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'processing', label: $t('page.menu.directory'), value: 'catalog' },
          { color: 'default', label: $t('page.menu.menu'), value: 'menu' },
          { color: 'error', label: $t('page.menu.button'), value: 'button' },
          { color: 'success', label: 'embedded', value: 'embedded' },
          { color: 'warning', label: 'link', value: 'link' },
        ],
      },
    },
    {
      field: 'authCode',
      title: $t('page.menu.authCode'),
      width: 200,
    },
    {
      field: 'path',
      title: $t('page.menu.path'),
      width: 200,
    },
    {
      field: 'component',
      title: $t('page.menu.component'),
      minWidth: 200,
    },
    {
      field: 'status',
      title: $t('page.common.status'),
      width: 100,
      cellRender: { name: 'CellTag' },
    },
    {
      field: 'operation',
      title: $t('page.common.action'),
      width: 200,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: $t('page.menu.name'),
          onClick: onActionClick,
        },
        options: [
          { code: 'append', text: $t('page.common.add') },
          'edit',
          'delete',
        ],
      },
    },
  ];
}
