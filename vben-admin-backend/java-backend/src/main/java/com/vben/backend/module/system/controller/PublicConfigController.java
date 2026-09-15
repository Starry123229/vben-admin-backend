package com.vben.backend.module.system.controller;

import com.vben.backend.common.result.R;
import com.vben.backend.module.system.service.SysConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * 公共配置查询接口：所有已登录用户可访问。
 * 与 SysConfigController 分离，避免类级 @SaCheckRole 影响。
 *
 * @author Starry
 */
@RestController
@RequiredArgsConstructor
public class PublicConfigController {

    private final SysConfigService configService;

    /** 按 key 查值（所有已登录用户可访问） */
    @GetMapping("/system/config/key/{key}")
    public R<String> getByKey(@PathVariable String key) {
        return R.ok(configService.getValueByKey(key));
    }
}
