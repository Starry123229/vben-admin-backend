import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';
import { getDeptList } from '#/api/system/dept';
import { getRoleList } from '#/api/system/role';

export function useUserFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录账号',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
      help: '新建时必填；编辑时留空表示不修改',
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: '真实姓名',
    },
    {
      component: 'ApiSelect',
      fieldName: 'deptId',
      label: '部门',
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
      label: '角色',
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
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

export function useUserGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录账号',
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
    },
  ];
}

export function useUserColumns(
  onActionClick: OnActionClickFn<SystemUserApi.SystemUser>,
  onStatusChange?: (newStatus: any, row: SystemUserApi.SystemUser) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns<SystemUserApi.SystemUser> {
  return [
    {
      field: 'username',
      title: '登录账号',
      width: 160,
    },
    {
      field: 'realName',
      title: '真实姓名',
      width: 140,
    },
    {
      field: 'roleCodes',
      title: '角色',
      formatter: ({ row }) => (row.roleCodes || []).join('，') || '-',
      minWidth: 140,
    },
    {
      field: 'deptId',
      title: '部门',
      width: 120,
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: {
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        attrs: { beforeChange: onStatusChange },
      },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 140,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'operation',
      title: '操作',
      width: 160,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'username',
          nameTitle: '登录账号',
          onClick: onActionClick,
        },
      },
    },
  ];
}
