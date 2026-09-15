package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.R;
import com.vben.backend.module.system.entity.SysDictData;
import com.vben.backend.module.system.service.SysDictService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公共字典查询接口：所有已登录用户可访问（用于下拉选项）。
 * 与 SysDictController 分离，避免类级 @SaCheckRole 影响。
 *
 * @author Starry
 */
@RestController
@RequiredArgsConstructor
public class PublicDictController {

    private final SysDictService dictService;

    /** 按字典编码查数据（所有已登录用户可访问，用于下拉选项） */
    @GetMapping("/system/dict/data/code/{code}")
    public R<List<SysDictData>> dataListByCode(@PathVariable String code) {
        return R.ok(dictService.dataListByCode(code));
    }
}
