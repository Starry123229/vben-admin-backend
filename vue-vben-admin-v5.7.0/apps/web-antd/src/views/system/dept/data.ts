import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';
import { getDeptList } from '#/api/system/dept';

export function useDeptFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '部门名称',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      fieldName: 'pid',
      label: '上级部门',
      help: '留空表示顶级部门',
      componentProps: {
        allowClear: true,
        labelField: 'name',
        valueField: 'id',
        api: async () => await getDeptList(),
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

export function useDeptGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: '部门名称',
    },
  ];
}

export function useDeptColumns(
  onActionClick: OnActionClickFn<SystemDeptApi.SystemDept>,
): VxeTableGridColumns<SystemDeptApi.SystemDept> {
  return [
    {
      field: 'name',
      title: '部门名称',
      width: 200,
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: { name: 'CellTag' },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 160,
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
      width: 140,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: '部门名称',
          onClick: onActionClick,
        },
      },
    },
  ];
}
