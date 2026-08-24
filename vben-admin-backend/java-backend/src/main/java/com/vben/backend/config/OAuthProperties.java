package com.vben.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 第三方 OAuth 登录配置（application.yml {@code vben.auth.oauth.*}）。
 *
 * <p>client-id/secret 留空时对应 provider 走本地 mock 流程（可点通演示）；
 * 配置真实凭证后授权跳转官方页。敏感值建议通过环境变量注入（yml 中已用占位符）。</p>
 *
 * @author Starry
 */
@Data
@Component
@ConfigurationProperties(prefix = "vben.auth.oauth")
public class OAuthProperties {

    /** QQ 互联（connect.qq.com） */
    private Provider qq = new Provider();

    /** 微信开放平台网站应用（open.weixin.qq.com） */
    private Provider wechat = new Provider();

    /** GitHub OAuth App（github.com/settings/developers） */
    private Provider github = new Provider();

    /** Google OAuth 客户端（console.cloud.google.com） */
    private Provider google = new Provider();

    /**
     * 按 provider 名取配置；不支持的 provider 返回 null。
     *
     * @param provider 小写标识：qq/wechat/github/google
     */
    public Provider of(String provider) {
        return switch (provider) {
            case "qq" -> qq;
            case "wechat" -> wechat;
            case "github" -> github;
            case "google" -> google;
            default -> null;
        };
    }

    /** 单个第三方平台的凭证与回调配置 */
    @Data
    public static class Provider {
        /** 是否启用（false 时前端应隐藏对应登录图标） */
        private boolean enabled = true;
        /** 平台分配的 AppId/Client ID；留空走本地 mock 流程 */
        private String clientId = "";
        /** 平台分配的 AppSecret/Client Secret（换 access_token 用） */
        private String clientSecret = "";
        /** OAuth 回调地址，须与平台后台登记的一致 */
        private String redirectUri = "";
    }
}