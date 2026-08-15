package com.vben.backend.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.dto.DeptSaveRequest;
import com.vben.backend.module.system.entity.SysDept;
import com.vben.backend.module.system.mapper.SysDeptMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部门领域服务：部门 CRUD 与树形查询。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysDeptService {

    private final SysDeptMapper deptMapper;
    private final SysUserMapper userMapper;

    /** 部门列表（扁平，前端自行组树） */
    public List<SysDept> list(String keyword) {
        LambdaQueryWrapper<SysDept> w = new LambdaQueryWrapper<SysDept>()
                .orderByAsc(SysDept::getId);
        if (StringUtils.isNotBlank(keyword)) {
            w.like(SysDept::getName, keyword);
        }
        return deptMapper.selectList(w);
    }

    /** 新建部门 */
    public Long create(DeptSaveRequest req) {
        if (StringUtils.isBlank(req.getName())) {
            throw ServiceException.badRequest("部门名称不能为空");
        }
        SysDept dept = new SysDept();
        dept.setPid(req.getPid() == null ? 0L : req.getPid());
        dept.setName(req.getName());
        dept.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        dept.setRemark(req.getRemark());
        dept.setCreateTime(LocalDateTime.now());
        deptMapper.insert(dept);
        return dept.getId();
    }

    /** 更新部门 */
    public void update(DeptSaveRequest req) {
        if (req.getId() == null) {
            throw ServiceException.badRequest("部门 ID 不能为空");
        }
        SysDept dept = deptMapper.selectById(req.getId());
        if (dept == null) {
            throw ServiceException.badRequest("部门不存在");
        }
        if (req.getPid() != null) {
            if (req.getPid().equals(dept.getId())) {
                throw ServiceException.badRequest("父部门不能为自身");
            }
            dept.setPid(req.getPid());
        }
        if (StringUtils.isNotBlank(req.getName())) {
            dept.setName(req.getName());
        }
        if (req.getStatus() != null) {
            dept.setStatus(req.getStatus());
        }
        dept.setRemark(req.getRemark());
        deptMapper.updateById(dept);
    }

    /** 删除部门：有子部门或已关联用户则拒绝 */
    public void remove(Long id) {
        long children = deptMapper.selectCount(new LambdaQueryWrapper<SysDept>().eq(SysDept::getPid, id));
        if (children > 0) {
            throw ServiceException.badRequest("该部门存在子部门，无法删除");
        }
        long users = userMapper.selectCount(new LambdaQueryWrapper<com.vben.backend.module.system.entity.SysUser>()
                .eq(com.vben.backend.module.system.entity.SysUser::getDeptId, id));
        if (users > 0) {
            throw ServiceException.badRequest("该部门下存在用户，无法删除");
        }
        deptMapper.deleteById(id);
    }
}
