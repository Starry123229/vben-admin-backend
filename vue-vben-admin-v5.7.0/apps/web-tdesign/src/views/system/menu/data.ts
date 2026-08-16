import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import { SystemMenuApi } from '#/api/system/menu';

export function useMenuFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'type',
      label: '菜单类型',
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
      label: '菜单名称(路由名)',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'pid',
      label: '上级菜单',
      formItemClass: 'items-start',
      modelPropName: 'modelValue',
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '菜单标题',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'path',
      label: '路由路径',
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
      label: '组件路径',
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
      label: '权限标识',
      help: '按钮型菜单必填，如 system:user:create',
      dependencies: {
        show: (values) => values.type === 'button',
        triggerFields: ['type'],
      },
    },
    {
      component: 'IconPicker',
      fieldName: 'icon',
      label: '图标',
      dependencies: {
        show: (values) =>
          ['catalog', 'embedded', 'link', 'menu'].includes(values.type),
        triggerFields: ['type'],
      },
    },
    {
      component: 'Input',
      fieldName: 'redirect',
      label: '重定向',
      help: '目录型菜单可设置，如 /system/user',
      dependencies: {
        show: (values) => values.type === 'catalog',
        triggerFields: ['type'],
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      defaultValue: 0,
      componentProps: { class: 'w-full' },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      defaultValue: 1,
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 0 },
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
      title: '菜单标题',
      treeNode: true,
      fixed: 'left',
      width: 240,
      slots: { default: 'title' },
    },
    {
      field: 'type',
      title: '类型',
      width: 100,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'processing', label: '目录', value: 'catalog' },
          { color: 'default', label: '菜单', value: 'menu' },
          { color: 'error', label: '按钮', value: 'button' },
          { color: 'success', label: '内嵌', value: 'embedded' },
          { color: 'warning', label: '外链', value: 'link' },
        ],
      },
    },
    {
      field: 'authCode',
      title: '权限标识',
      width: 200,
    },
    {
      field: 'path',
      title: '路由路径',
      width: 200,
    },
    {
      field: 'component',
      title: '组件路径',
      minWidth: 200,
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: { name: 'CellTag' },
    },
    {
      field: 'operation',
      title: '操作',
      width: 200,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: '菜单名称',
          onClick: onActionClick,
        },
        options: [
          { code: 'append', text: '新增下级' },
          'edit',
          'delete',
        ],
      },
    },
  ];
}
