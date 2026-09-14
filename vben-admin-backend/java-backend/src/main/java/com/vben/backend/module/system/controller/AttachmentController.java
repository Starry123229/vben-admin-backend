package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysAttachment;
import com.vben.backend.module.system.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 附件中心接口（/system/attachment/**）。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/attachment")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /** 分页查询附件列表 */
    @GetMapping("/list")
    public R<PageResult<SysAttachment>> list(@RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int pageSize,
                                              @RequestParam(required = false) String bizType,
                                              @RequestParam(required = false) String originalName) {
        return R.ok(attachmentService.list(page, pageSize, bizType, originalName));
    }

    /** 获取附件详情 */
    @GetMapping("/{id}")
    public R<SysAttachment> getById(@PathVariable Long id) {
        return R.ok(attachmentService.getById(id));
    }

    /** 上传文件 */
    @Log(module = "附件中心", description = "上传文件")
    @PostMapping("/upload")
    public R<SysAttachment> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam(required = false) String bizType,
                                    @RequestParam(required = false) String bizId) {
        return R.ok(attachmentService.upload(file, bizType, bizId));
    }

    /** 删除附件 */
    @Log(module = "附件中心", description = "删除附件")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        attachmentService.delete(id);
        return R.ok();
    }
}
