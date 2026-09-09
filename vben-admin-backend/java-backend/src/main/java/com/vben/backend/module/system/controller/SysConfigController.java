package com.vben.backend.module.system.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.vben.backend.common.result.R;
import com.vben.backend.module.system.annotation.Log;
import com.vben.backend.module.system.entity.SysConfig;
import com.vben.backend.module.system.service.SysConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/config")
@RequiredArgsConstructor
@SaCheckRole(value = {"super", "admin"}, mode = SaMode.OR)
public class SysConfigController {

    private final SysConfigService configService;

    @GetMapping("/list")
    public R<?> list(@RequestParam(defaultValue = "1") int page,
                     @RequestParam(defaultValue = "10") int pageSize,
                     @RequestParam(required = false) String name,
                     @RequestParam(required = false) String key) {
        return R.ok(configService.list(page, pageSize, name, key));
    }

    /** 按 key 查值（所有已登录用户可访问） */
    @GetMapping("/key/{key}")
    public R<String> getByKey(@PathVariable String key) {
        return R.ok(configService.getValueByKey(key));
    }

    @Log(module = "参数配置", description = "新增参数")
    @PostMapping
    public R<Long> create(@RequestBody SysConfig config) {
        return R.ok(configService.create(config));
    }

    @Log(module = "参数配置", description = "编辑参数")
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysConfig config) {
        if (config.getId() == null) config.setId(id);
        configService.update(config);
        return R.ok();
    }

    @Log(module = "参数配置", description = "删除参数")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        configService.delete(id);
        return R.ok();
    }

    @GetMapping("/key-exists")
    public R<Boolean> keyExists(@RequestParam String key, @RequestParam(required = false) Long id) {
        return R.ok(configService.keyExists(key, id));
    }
}
