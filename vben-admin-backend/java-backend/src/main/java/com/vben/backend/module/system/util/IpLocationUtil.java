package com.vben.backend.module.system.util;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * IP 地理位置查询工具。
 *
 * <p>策略：
 * <ol>
 *   <li>本地局域网 IP → "内网"</li>
 *   <li>本机回环 → "本地"</li>
 *   <li>其他公网 IP → "未知"（生产环境可接入 ip2region 离线库）</li>
 * </ol>
 *
 * <p>如需精确到城市级别，建议引入 ip2region 的 xdb 文件，本项目预留了接口。
 * 参考：<a href="https://github.com/lionsoul2014/ip2region">ip2region</a>
 *
 * @author Starry
 */
@Slf4j
@Component
public class IpLocationUtil {

    /**
     * 根据 IP 查询地理位置。
     *
     * @param ip IP 地址
     * @return 地理位置描述（如"北京市"或"内网"）
     */
    public static String getLocation(String ip) {
        if (ip == null || ip.isBlank()) {
            return "未知";
        }

        // 本机回环
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip) || "localhost".equals(ip)) {
            return "本地";
        }

        // 内网私有地址
        if (isInternalIp(ip)) {
            return "内网";
        }

        // 生产环境建议接入 ip2region
        // 简化实现：返回"未知"，后续可扩展
        return "未知";
    }

    /**
     * 判断是否为内网私有 IP。
     */
    private static boolean isInternalIp(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            return addr.isSiteLocalAddress()      // 10.x.x.x / 172.16-31.x.x / 192.168.x.x
                    || addr.isLoopbackAddress()    // 127.x.x.x
                    || addr.isAnyLocalAddress();   // 0.0.0.0
        } catch (UnknownHostException e) {
            return false;
        }
    }
}
