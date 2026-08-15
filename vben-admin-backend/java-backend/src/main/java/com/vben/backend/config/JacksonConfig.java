package com.vben.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.module.SimpleModule;
import tools.jackson.databind.ser.std.ToStringSerializer;

/**
 * Jackson 序列化配置：Long → String（契约 §8.9，避免超出 JS 安全整数精度丢失）。
 *
 * @author Starry
 */
@Configuration
public class JacksonConfig {

    /** Boot 4 自动注册所有 JacksonModule Bean */
    @Bean
    public JacksonModule longToStringModule() {
        SimpleModule module = new SimpleModule();
        module.addSerializer(Long.class, ToStringSerializer.instance);
        module.addSerializer(Long.TYPE, ToStringSerializer.instance);
        return module;
    }
}
