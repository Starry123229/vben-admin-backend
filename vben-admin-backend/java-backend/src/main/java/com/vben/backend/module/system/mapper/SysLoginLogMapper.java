package com.vben.backend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vben.backend.module.system.entity.SysLoginLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 登录日志 Mapper。
 *
 * @author Starry
 */
@Mapper
public interface SysLoginLogMapper extends BaseMapper<SysLoginLog> {

    /**
     * 按浏览器分组统计（SQL 层 GROUP BY 替代全表加载到内存）。
     * 返回 [{browser, cnt}, ...]
     */
    @Select("""
            SELECT COALESCE(NULLIF(TRIM(browser), ''), '其他') AS browser, COUNT(*) AS cnt
            FROM sys_login_log
            WHERE browser IS NOT NULL AND browser != '' AND browser != 'Unknown'
            GROUP BY browser
            ORDER BY cnt DESC
            """)
    List<Map<String, Object>> countByBrowser();
}
