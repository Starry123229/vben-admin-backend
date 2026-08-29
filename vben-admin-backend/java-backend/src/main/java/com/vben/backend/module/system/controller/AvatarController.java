package com.vben.backend.module.system.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/**
 * 公开头像生成端点：/avatar/{name}.svg
 *
 * <p>img 标签无法携带 Authorization 头，故此端点不做鉴权；
 * 仅根据名称生成首字母 SVG，不含任何敏感数据。</p>
 *
 * @author Starry
 */
@RestController
public class AvatarController {

    private static final String[] PALETTE = {
        "#4f6ef7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
    };

    @GetMapping("/avatar/{name}.svg")
    public ResponseEntity<String> avatar(@PathVariable String name) {
        String clean = name.replaceAll("[^\\w\\u4e00-\\u9fa5-]", "");
        if (clean.isEmpty()) {
            clean = "U";
        }
        String initials = initials(clean);
        String color = PALETTE[Math.abs(clean.hashCode()) % PALETTE.length];
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
                  <rect width="96" height="96" rx="48" fill="%s"/>
                  <text x="48" y="62" font-family="system-ui, sans-serif" font-size="38" font-weight="600"
                        fill="#fff" text-anchor="middle">%s</text>
                </svg>
                """
                .formatted(color, initials);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/svg+xml"))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)))
                .body(svg);
    }

    /** 中文名取末 2 字，ASCII 取首 2 字母大写，单字取 1 字 */
    private String initials(String name) {
        String ascii = name.replaceAll("[^\\x00-\\x7F]", "");
        if (ascii.length() >= 2) {
            return ascii.substring(0, 2).toUpperCase();
        }
        if (!ascii.isEmpty()) {
            return ascii.toUpperCase();
        }
        return name.length() > 2 ? name.substring(name.length() - 2) : name;
    }
}
