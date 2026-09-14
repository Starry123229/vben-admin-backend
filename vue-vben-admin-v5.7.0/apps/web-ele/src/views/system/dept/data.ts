import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';
import { getDeptList } from '#/api/system/dept';

import { $t } from '#/locales';

export function useDeptFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.dept.name'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      fieldName: 'pid',
      label: $t('page.dept.pid'),
      help: $t('page.dept.pid'),
      modelPropName: 'value',
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

export function useDeptGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('page.dept.name'),
    },
  ];
}

export function useDeptColumns(
  onActionClick: OnActionClickFn<SystemDeptApi.SystemDept>,
): VxeTableGridColumns<SystemDeptApi.SystemDept> {
  return [
    {
      field: 'name',
      title: $t('page.dept.name'),
      width: 200,
    },
    {
      field: 'status',
      title: $t('page.common.status'),
      width: 100,
      cellRender: { name: 'CellTag' },
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
          nameTitle: $t('page.dept.name'),
          onClick: onActionClick,
        },
      },
    },
  ];
}
