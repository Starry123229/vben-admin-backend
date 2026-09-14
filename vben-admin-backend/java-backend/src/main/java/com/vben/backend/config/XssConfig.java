package com.vben.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * XSS 防护配置：全局过滤器对请求参数和请求体中的 HTML 特殊字符进行转义。
 *
 * <p>策略：
 * <ul>
 *   <li>GET 请求参数：在 getParameter/getParameterValues 中转义</li>
 *   <li>POST/PUT JSON 请求体：Content-Type 为 application/json 时由 JacksonConfig 已处理</li>
 *   <li>文件上传（multipart）不过滤</li>
 * </ul>
 *
 * @author Starry
 */
@Configuration
public class XssConfig {

    /**
     * 注册 XSS 过滤器，放在最前面
     */
    @Bean
    public FilterRegistrationBean<XssFilter> xssFilterRegistration() {
        FilterRegistrationBean<XssFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new XssFilter());
        registration.addUrlPatterns("/*");
        registration.setName("xssFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    /**
     * XSS 过滤器：跳过 multipart 请求（文件上传）
     */
    public static class XssFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletRequest req = (HttpServletRequest) request;
            String contentType = req.getContentType();
            // 文件上传不过滤
            if (contentType != null && contentType.startsWith("multipart/")) {
                chain.doFilter(request, response);
                return;
            }
            chain.doFilter(new XssRequestWrapper(req), response);
        }
    }

    /**
     * 请求包装器：转义参数中的 HTML 特殊字符
     */
    public static class XssRequestWrapper extends HttpServletRequestWrapper {

        private static final Pattern[] SCRIPT_PATTERNS = {
                Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
                Pattern.compile("src[\s]*=[\s]*'(.*?)'", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE),
                Pattern.compile("src[\s]*=[\s]*\"(.*?)\"", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE),
                Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE),
                Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE),
                Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
                Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
                Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE),
        };

        public XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            return clean(super.getParameter(name));
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;
            String[] cleaned = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                cleaned[i] = clean(values[i]);
            }
            return cleaned;
        }

        @Override
        public String getHeader(String name) {
            return clean(super.getHeader(name));
        }

        /**
         * 清理 XSS 风险字符：移除脚本标签，转义 HTML 特殊字符
         */
        private String clean(String value) {
            if (value == null) return null;
            String cleaned = value;
            for (Pattern pattern : SCRIPT_PATTERNS) {
                cleaned = pattern.matcher(cleaned).replaceAll("");
            }
            // HTML 实体转义
            cleaned = cleaned.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&#34;")
                    .replace("'", "&#39;");
            return cleaned;
        }
    }
}
