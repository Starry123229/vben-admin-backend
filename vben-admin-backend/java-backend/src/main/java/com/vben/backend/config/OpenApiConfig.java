package com.vben.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 文档配置：文档信息 + accessToken 全局鉴权方案。
 *
 * @author Starry
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Vben Admin Java 后端")
                        .description("适配 vue-vben-admin v5.7.0 前端契约，详见 docs/api-contract.md")
                        .version("0.0.1-SNAPSHOT"))
                // 全局 Bearer 鉴权：文档页右上角 Authorize 填 accessToken
                .components(new Components().addSecuritySchemes("accessToken",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")))
                .addSecurityItem(new SecurityRequirement().addList("accessToken"));
    }
}
