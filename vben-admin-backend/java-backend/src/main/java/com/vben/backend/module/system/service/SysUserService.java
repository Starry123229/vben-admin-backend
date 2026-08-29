package com.vben.backend.module.system.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vben.backend.common.result.PageResult;
import com.vben.backend.common.result.ServiceException;
import com.vben.backend.module.system.dto.ChangePasswordRequest;
import com.vben.backend.module.system.dto.ProfileUpdateRequest;
import com.vben.backend.module.system.dto.UserItemVO;
import com.vben.backend.module.system.dto.UserSaveRequest;
import com.vben.backend.module.system.entity.SysRole;
import com.vben.backend.module.system.entity.SysUser;
import com.vben.backend.module.system.entity.SysUserRole;
import com.vben.backend.module.system.mapper.SysRoleMapper;
import com.vben.backend.module.system.mapper.SysUserMapper;
import com.vben.backend.module.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 用户领域服务：用户查询、CRUD 与密码管理。
 *
 * @author Starry
 */
@Service
@RequiredArgsConstructor
public class SysUserService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    /** 头像等上传文件的存储根目录（默认 ./uploads，可用 V_BEN_UPLOAD_DIR 覆盖） */
    @Value("${vben.auth.upload-dir:./uploads}")
    private String uploadDir;

    private static final long AVATAR_MAX_SIZE = 5 * 1024 * 1024L;
    private static final Set<String> AVATAR_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    /** 按ID查询用户 */
    public SysUser getById(long userId) {
        return userMapper.selectById(userId);
    }

    /** 用户角色编码列表（仅启用角色） */
    public List<String> getRoleCodes(long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId)).stream()
                .map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                        .in(SysRole::getId, roleIds)
                        .eq(SysRole::getStatus, 1)).stream()
                .map(SysRole::getCode).toList();
    }

    /** 用户分页列表（脱敏，附带角色） */
    public PageResult<UserItemVO> listUsers(int page, int pageSize, String username, Integer status, Long deptId) {
        LambdaQueryWrapper<SysUser> w = new LambdaQueryWrapper<SysUser>()
                .orderByDesc(SysUser::getId);
        if (StringUtils.hasText(username)) {
            w.like(SysUser::getUsername, username);
        }
        if (status != null) {
            w.eq(SysUser::getStatus, status);
        }
        if (deptId != null) {
            w.eq(SysUser::getDeptId, deptId);
        }
        IPage<SysUser> p = userMapper.selectPage(new Page<>(page, pageSize), w);
        List<UserItemVO> items = p.getRecords().stream().map(this::toVO).toList();
        return new PageResult<>(items, p.getTotal());
    }

    /** 新建用户 */
    @Transactional
    public Long createUser(UserSaveRequest req) {
        if (!StringUtils.hasText(req.getUsername())) {
            throw ServiceException.badRequest("登录名不能为空");
        }
        if (!StringUtils.hasText(req.getPassword())) {
            throw ServiceException.badRequest("密码不能为空");
        }
        long dup = userMapper.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername()));
        if (dup > 0) {
            throw ServiceException.badRequest("登录名已存在");
        }
        SysUser user = new SysUser();
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRealName(req.getRealName());
        user.setAvatar(req.getAvatar());
        user.setHomePath(req.getHomePath());
        user.setDeptId(req.getDeptId());
        user.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        user.setRemark(req.getRemark());
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.insert(user);
        bindRoles(user.getId(), req.getRoleIds());
        return user.getId();
    }

    /** 更新用户 */
    @Transactional
    public void updateUser(UserSaveRequest req) {
        if (req.getId() == null) {
            throw ServiceException.badRequest("用户 ID 不能为空");
        }
        SysUser user = userMapper.selectById(req.getId());
        if (user == null) {
            throw ServiceException.badRequest("用户不存在");
        }
        if (StringUtils.hasText(req.getUsername())) {
            long dup = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getUsername, req.getUsername()).ne(SysUser::getId, req.getId()));
            if (dup > 0) {
                throw ServiceException.badRequest("登录名已存在");
            }
            user.setUsername(req.getUsername());
        }
        if (StringUtils.hasText(req.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        if (StringUtils.hasText(req.getRealName())) {
            user.setRealName(req.getRealName());
        }
        user.setAvatar(req.getAvatar());
        user.setHomePath(req.getHomePath());
        user.setDeptId(req.getDeptId());
        if (req.getStatus() != null) {
            user.setStatus(req.getStatus());
        }
        user.setRemark(req.getRemark());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        // 仅当请求携带角色列表时才重新绑定（空列表=清空，null=保持不变）
        if (req.getRoleIds() != null) {
            bindRoles(user.getId(), req.getRoleIds());
        }
    }

    /** 删除用户（禁止删除自己） */
    @Transactional
    public void deleteUser(Long id) {
        if (id == null) {
            throw ServiceException.badRequest("用户 ID 不能为空");
        }
        long loginId = StpUtil.getLoginIdAsLong();
        if (id == loginId) {
            throw ServiceException.badRequest("不能删除当前登录账号");
        }
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, id));
        userMapper.deleteById(id);
    }

    /** 当前用户更新自己的资料（个人中心-基本设置：姓名/简介） */
    public void updateProfile(ProfileUpdateRequest req) {
        long loginId = StpUtil.getLoginIdAsLong();
        SysUser user = userMapper.selectById(loginId);
        if (user == null) {
            throw ServiceException.badRequest("用户不存在");
        }
        if (StringUtils.hasText(req.getRealName())) {
            user.setRealName(req.getRealName());
        }
        // intro 允许清空（传空串视为清空）
        user.setIntro(req.getIntro());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /**
     * 当前用户上传头像：校验类型与大小，落盘到 {upload-dir}/avatar/，
     * 更新 sys_user.avatar 并返回可公开访问的 URL（/avatar/file/{filename}）。
     */
    public String saveAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ServiceException.badRequest("请选择头像文件");
        }
        if (file.getSize() > AVATAR_MAX_SIZE) {
            throw ServiceException.badRequest("头像文件不能超过 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw ServiceException.badRequest("仅支持图片文件");
        }
        String original = file.getOriginalFilename();
        String ext = original == null ? "" : original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (!AVATAR_EXTENSIONS.contains(ext)) {
            throw ServiceException.badRequest("仅支持 jpg/png/webp/gif 格式");
        }
        long loginId = StpUtil.getLoginIdAsLong();
        String filename = "u" + loginId + "-" + System.currentTimeMillis() + ext;
        try {
            Path dir = Paths.get(uploadDir, "avatar").toAbsolutePath().normalize();
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename).toFile());
        } catch (IOException e) {
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR, "头像保存失败");
        }
        String url = "/api/avatar/file/" + filename;
        applyAvatar(loginId, url);
        return url;
    }

    /** 更新用户头像字段 */
    private void applyAvatar(long userId, String avatarUrl) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw ServiceException.badRequest("用户不存在");
        }
        user.setAvatar(avatarUrl);
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /** 当前用户修改自己的密码 */
    public void changePassword(ChangePasswordRequest req) {
        if (!StringUtils.hasText(req.getOldPassword())
                || !StringUtils.hasText(req.getNewPassword())
                || !StringUtils.hasText(req.getConfirmPassword())) {
            throw ServiceException.badRequest("密码项不能为空");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw ServiceException.badRequest("两次输入的新密码不一致");
        }
        long loginId = StpUtil.getLoginIdAsLong();
        SysUser user = userMapper.selectById(loginId);
        if (user == null || !passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            throw ServiceException.badRequest("原密码不正确");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /** 管理员重置某用户密码（无需原密码） */
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (id == null) {
            throw ServiceException.badRequest("用户 ID 不能为空");
        }
        if (!StringUtils.hasText(newPassword)) {
            throw ServiceException.badRequest("新密码不能为空");
        }
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw ServiceException.badRequest("用户不存在");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    // ----------------------------------------------------------------- 私有方法

    /** 替换用户-角色关联 */
    private void bindRoles(long userId, List<Long> roleIds) {
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, userId));
        if (roleIds == null || roleIds.isEmpty()) {
            return;
        }
        for (Long roleId : roleIds) {
            SysUserRole ur = new SysUserRole();
            ur.setUserId(userId);
            ur.setRoleId(roleId);
            userRoleMapper.insert(ur);
        }
    }

    /** 实体转脱敏 VO（含角色） */
    private UserItemVO toVO(SysUser user) {
        UserItemVO vo = new UserItemVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setAvatar(user.getAvatar());
        vo.setHomePath(user.getHomePath());
        vo.setDeptId(user.getDeptId());
        vo.setStatus(user.getStatus());
        vo.setRemark(user.getRemark());
        vo.setCreateTime(user.getCreateTime());
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, user.getId())).stream()
                .map(SysUserRole::getRoleId).toList();
        vo.setRoleIds(roleIds);
        if (!roleIds.isEmpty()) {
            vo.setRoleCodes(roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                            .in(SysRole::getId, roleIds)).stream()
                    .map(SysRole::getCode).toList());
        }
        return vo;
    }
}
