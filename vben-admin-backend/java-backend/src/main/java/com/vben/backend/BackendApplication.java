package com.vben.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Vben Admin Java 后端启动类。
 *
 * <p>契约详见仓库 docs/api-contract.md。包结构：
 * common（公共基础）/ config（全局配置）/ framework（框架扩展）/ module（业务模块）。
 *
 * @author vben
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
