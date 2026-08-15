package com.vben.backend.module.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.auth.entity.SysRefreshToken;
import org.apache.ibatis.annotations.Mapper;

/**
 * 刷新令牌 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysRefreshTokenMapper extends BaseMapper<SysRefreshToken> {
}
