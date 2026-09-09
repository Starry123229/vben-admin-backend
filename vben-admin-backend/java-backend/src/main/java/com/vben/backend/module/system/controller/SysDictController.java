package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysDictData;
import com.vben.backend.module.system.entity.SysDictType;
import com.vben.backend.module.system.service.SysDictService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 数据字典接口（/system/dict/**）。
 * 仅 super/admin 可访问。
 *
 * @author Starry
 */
@RestController
@RequestMapping("/system/dict")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SysDictController {

    private final SysDictService dictService;

    // ---------------------------------------------------------------- 字典类型

    @GetMapping("/type/list")
    public R<?> typeList(@RequestParam(defaultValue = "1") int page,
                         @RequestParam(defaultValue = "10") int pageSize,
                         @RequestParam(required = false) String name,
                         @RequestParam(required = false) String code,
                         @RequestParam(required = false) Integer status) {
        return R.ok(dictService.typeList(page, pageSize, name, code, status));
    }

    @GetMapping("/type/code-exists")
    public R<Boolean> codeExists(@RequestParam String code,
                                 @RequestParam(required = false) Long id) {
        return R.ok(dictService.codeExists(code, id));
    }

    @Log(module = "字典管理", description = "新增字典类型")
    @PostMapping("/type")
    public R<Long> createType(@RequestBody SysDictType type) {
        return R.ok(dictService.createType(type));
    }

    @Log(module = "字典管理", description = "编辑字典类型")
    @PutMapping("/type/{id}")
    public R<Void> updateType(@PathVariable Long id, @RequestBody SysDictType type) {
        if (type.getId() == null) {
            type.setId(id);
        }
        dictService.updateType(type);
        return R.ok();
    }

    @Log(module = "字典管理", description = "删除字典类型")
    @DeleteMapping("/type/{id}")
    public R<Void> deleteType(@PathVariable Long id) {
        dictService.deleteType(id);
        return R.ok();
    }

    // ---------------------------------------------------------------- 字典数据

    @GetMapping("/data/list")
    public R<List<SysDictData>> dataList(@RequestParam Long typeId) {
        return R.ok(dictService.dataList(typeId));
    }

    /** 按字典编码查数据（所有已登录用户可访问，用于下拉选项） */
    @GetMapping("/data/code/{code}")
    public R<List<SysDictData>> dataListByCode(@PathVariable String code) {
        return R.ok(dictService.dataListByCode(code));
    }

    @Log(module = "字典管理", description = "新增字典数据")
    @PostMapping("/data")
    public R<Long> createData(@RequestBody SysDictData data) {
        return R.ok(dictService.createData(data));
    }

    @Log(module = "字典管理", description = "编辑字典数据")
    @PutMapping("/data/{id}")
    public R<Void> updateData(@PathVariable Long id, @RequestBody SysDictData data) {
        if (data.getId() == null) {
            data.setId(id);
        }
        dictService.updateData(data);
        return R.ok();
    }

    @Log(module = "字典管理", description = "删除字典数据")
    @DeleteMapping("/data/{id}")
    public R<Void> deleteData(@PathVariable Long id) {
        dictService.deleteData(id);
        return R.ok();
    }
}
