import { requestClient } from '#/api/request';

export namespace AttachmentApi {
  export interface AttachmentItem {
    id: number | string;
    originalName: string;
    storagePath: string;
    fileSize: number;
    contentType?: string;
    fileExt?: string;
    md5Hash?: string;
    uploadUserId: number;
    uploadUsername?: string;
    bizType?: string;
    bizId?: string;
    url?: string;
    createTime?: string;
  }
}

/** 分页查询附件列表 */
export async function getAttachmentListApi(params: {
  page?: number;
  pageSize?: number;
  bizType?: string;
  originalName?: string;
}) {
  return requestClient.get<{
    items: AttachmentApi.AttachmentItem[];
    total: number;
  }>('/system/attachment/list', { params });
}

/** 获取附件详情 */
export async function getAttachmentByIdApi(id: number | string) {
  return requestClient.get<AttachmentApi.AttachmentItem>(
    `/system/attachment/${id}`,
  );
}

/** 上传文件 */
export async function uploadAttachmentApi(
  file: File,
  bizType?: string,
  bizId?: string,
) {
  const formData = new FormData();
  formData.append('file', file);
  if (bizType) formData.append('bizType', bizType);
  if (bizId) formData.append('bizId', bizId);
  return requestClient.post<AttachmentApi.AttachmentItem>(
    '/system/attachment/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}

/** 删除附件 */
export async function deleteAttachmentApi(id: number | string) {
  return requestClient.delete(`/system/attachment/${id}`);
}
