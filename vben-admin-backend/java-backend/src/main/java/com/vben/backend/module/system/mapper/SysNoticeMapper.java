package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysNotice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知消息 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysNoticeMapper extends BaseMapper<SysNotice> {

    /**
     * 批量插入通知（替代循环逐条 insert，减少 N 次网络往返为 1 次）。
     */
    @Insert({
        "<script>",
        "INSERT INTO sys_notice (title, message, avatar, link, is_read, user_id, role_id, type, create_time) VALUES",
        "<foreach collection='list' item='item' separator=','>",
        "(#{item.title}, #{item.message}, #{item.avatar}, #{item.link}, #{item.isRead}, #{item.userId}, #{item.roleId}, #{item.type}, #{item.createTime})",
        "</foreach>",
        "</script>"
    })
    int insertBatch(@Param("list") List<SysNotice> list);
}
