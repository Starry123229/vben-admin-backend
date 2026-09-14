import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';
import { getDeptList } from '#/api/system/dept';
import { getRoleList } from '#/api/system/role';

import { $t } from '#/locales';

export function useUserFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('page.user.username'),
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('page.user.password'),
      help: $t('page.user.password'),
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: $t('page.user.realName'),
    },
    {
      component: 'ApiSelect',
      fieldName: 'deptId',
      label: $t('page.user.dept'),
      modelPropName: 'value',
      componentProps: {
        allowClear: true,
        labelField: 'name',
        valueField: 'id',
        api: async () => await getDeptList(),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'roleIds',
      label: $t('page.user.role'),
      modelPropName: 'value',
      componentProps: {
        multiple: true,
        allowClear: true,
        labelField: 'name',
        valueField: 'id',
        api: async () => (await getRoleList({ page: 1, pageSize: 1000 })).items,
      },
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
  ];
}

export function useUserGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('page.user.username'),
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('page.common.status'),
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

export function useUserColumns(
  onActionClick: OnActionClickFn<SystemUserApi.SystemUser>,
  onStatusChange?: (newStatus: any, row: SystemUserApi.SystemUser) => PromiseLike<boolean | undefined>,
  getDeptName?: (deptId: any) => string,
): VxeTableGridColumns<SystemUserApi.SystemUser> {
  return [
    {
      field: 'username',
      title: $t('page.user.username'),
      width: 160,
    },
    {
      field: 'realName',
      title: $t('page.user.realName'),
      width: 140,
    },
    {
      field: 'roleCodes',
      title: $t('page.user.role'),
      formatter: ({ row }) => (row.roleCodes || []).join('，') || '-',
      minWidth: 140,
    },
    {
      field: 'deptId',
      title: $t('page.user.dept'),
      width: 120,
      formatter: ({ row }) => {
        if (row.deptId == null) return '-';
        return getDeptName?.(row.deptId) || String(row.deptId);
      },
    },
    {
      field: 'status',
      title: $t('page.common.status'),
      width: 100,
      cellRender: {
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        // 状态切换需「编辑用户」权限码；无权限时 Switch 禁用
        attrs: { beforeChange: onStatusChange, accessCode: 'AC_100020' },
      },
    },
    {
      field: 'remark',
      title: $t('page.common.remark'),
      minWidth: 140,
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
      width: 160,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'username',
          nameTitle: $t('page.user.username'),
          onClick: onActionClick,
        },
        // 按钮级权限：与后端 @SaCheckPermission 同一套码
        options: [
          { code: 'edit', accessCode: 'AC_100020' },
          { code: 'delete', accessCode: 'AC_100030' },
        ],
      },
    },
  ];
}
