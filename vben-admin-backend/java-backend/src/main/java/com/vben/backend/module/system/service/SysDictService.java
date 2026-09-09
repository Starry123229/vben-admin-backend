package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.module.system.entity.SysDictData;
import com.vben.backend.module.system.entity.SysDictType;
import com.vben.backend.module.system.mapper.SysDictDataMapper;
import com.vben.backend.module.system.mapper.SysDictTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 数据字典服务。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysDictService {

    private final SysDictTypeMapper dictTypeMapper;
    private final SysDictDataMapper dictDataMapper;

    // ---------------------------------------------------------------- 字典类型

    public PageResult<SysDictType> typeList(int page, int pageSize, String name, String code, Integer status) {
        Page<SysDictType> p = new Page<>(page, Math.min(pageSize, 100));
        LambdaQueryWrapper<SysDictType> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(SysDictType::getName, name);
        }
        if (code != null && !code.isEmpty()) {
            wrapper.like(SysDictType::getCode, code);
        }
        if (status != null) {
            wrapper.eq(SysDictType::getStatus, status);
        }
        wrapper.orderByDesc(SysDictType::getCreateTime);
        IPage<SysDictType> result = dictTypeMapper.selectPage(p, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public Long createType(SysDictType type) {
        dictTypeMapper.insert(type);
        return type.getId();
    }

    public void updateType(SysDictType type) {
        dictTypeMapper.updateById(type);
    }

    public void deleteType(Long id) {
        dictTypeMapper.deleteById(id);
        // 同时删除关联的字典数据
        dictDataMapper.delete(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getTypeId, id));
    }

    public boolean codeExists(String code, Long excludeId) {
        LambdaQueryWrapper<SysDictType> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysDictType::getCode, code);
        if (excludeId != null) {
            wrapper.ne(SysDictType::getId, excludeId);
        }
        return dictTypeMapper.selectCount(wrapper) > 0;
    }

    // ---------------------------------------------------------------- 字典数据

    public List<SysDictData> dataList(Long typeId) {
        return dictDataMapper.selectList(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getTypeId, typeId)
                .orderByAsc(SysDictData::getSort));
    }

    /** 按字典编码查数据（前端通用下拉用） */
    public List<SysDictData> dataListByCode(String code) {
        SysDictType type = dictTypeMapper.selectOne(new LambdaQueryWrapper<SysDictType>()
                .eq(SysDictType::getCode, code));
        if (type == null) {
            return List.of();
        }
        return dictDataMapper.selectList(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getTypeId, type.getId())
                .eq(SysDictData::getStatus, 1)
                .orderByAsc(SysDictData::getSort));
    }

    public Long createData(SysDictData data) {
        dictDataMapper.insert(data);
        return data.getId();
    }

    public void updateData(SysDictData data) {
        dictDataMapper.updateById(data);
    }

    public void deleteData(Long id) {
        dictDataMapper.deleteById(id);
    }
}
