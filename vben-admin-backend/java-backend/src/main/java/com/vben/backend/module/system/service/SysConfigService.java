package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.module.system.entity.SysConfig;
import com.vben.backend.module.system.mapper.SysConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SysConfigService {

    private final SysConfigMapper configMapper;

    public PageResult<SysConfig> list(int page, int pageSize, String name, String key) {
        Page<SysConfig> p = new Page<>(page, Math.min(pageSize, 100));
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) wrapper.like(SysConfig::getName, name);
        if (key != null && !key.isEmpty()) wrapper.like(SysConfig::getKey, key);
        wrapper.orderByDesc(SysConfig::getCreateTime);
        IPage<SysConfig> result = configMapper.selectPage(p, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    /** 按 key 查值（所有已登录用户可访问） */
    public String getValueByKey(String key) {
        SysConfig config = configMapper.selectOne(new LambdaQueryWrapper<SysConfig>().eq(SysConfig::getKey, key));
        return config != null ? config.getValue() : null;
    }

    /** 批量按键查值 */
    public List<SysConfig> listByKeys(List<String> keys) {
        return configMapper.selectList(new LambdaQueryWrapper<SysConfig>().in(SysConfig::getKey, keys));
    }

    public Long create(SysConfig config) {
        configMapper.insert(config);
        return config.getId();
    }

    public void update(SysConfig config) {
        configMapper.updateById(config);
    }

    public void delete(Long id) {
        configMapper.deleteById(id);
    }

    public boolean keyExists(String key, Long excludeId) {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<SysConfig>().eq(SysConfig::getKey, key);
        if (excludeId != null) wrapper.ne(SysConfig::getId, excludeId);
        return configMapper.selectCount(wrapper) > 0;
    }
}
