import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { $t } from '#/locales';

export function useRoleFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.role.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('page.role.code'),
      help: $t('page.role.code'),
      rules: 'required',
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
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('page.common.remark'),
    },
    {
      component: 'Input',
      fieldName: 'menuIds',
      label: '菜单权限',
      formItemClass: 'items-start',
      modelPropName: 'modelValue',
    },
  ];
}

export function useRoleGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.role.name'),
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('page.common.status'),
      modelPropName: 'value',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('page.common.enable'), value: 1 },
          { label: $t('page.common.disable'), value: 0 },
        ],
      },
    },
  ];
}

export function useRoleColumns(
  onActionClick: OnActionClickFn<SystemRoleApi.SystemRole>,
  onStatusChange?: (newStatus: any, row: SystemRoleApi.SystemRole) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemRoleApi.SystemRole> {
  return [
    {
      field: 'name',
      title: $t('page.role.name'),
      width: 160,
    },
    {
      field: 'code',
      title: $t('page.role.code'),
      width: 160,
    },
    {
      field: 'status',
      title: $t('page.common.status'),
      width: 100,
      cellRender: {
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        // 状态切换需「编辑角色」权限码；无权限时 Switch 禁用
        attrs: { beforeChange: onStatusChange, accessCode: 'AC_1000002' },
      },
    },
    {
      field: 'remark',
      title: $t('page.common.remark'),
      minWidth: 160,
    },
    {
      field: 'createTime',
      title: $t('page.common.createTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'operation',
      title: $t('page.common.action'),
      width: 140,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: $t('page.role.name'),
          onClick: onActionClick,
        },
        // 按钮级权限：查看角色码只开放页面；增删改统一归「编辑角色」码
        options: [
          { code: 'edit', accessCode: 'AC_1000002' },
          { code: 'delete', accessCode: 'AC_1000002' },
        ],
      },
    },
  ];
}
