package com.vben.backend.common.result;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 业务异常，由全局异常处理器转为「非 2xx 状态码 + code:-1 包裹体」。
 *
 * @author Starry
 */
@Getter
public class ServiceException extends RuntimeException {

    /** HTTP 状态码 */
    private final HttpStatus status;

    public ServiceException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    /** 400 参数/业务校验失败 */
    public static ServiceException badRequest(String message) {
        return new ServiceException(HttpStatus.BAD_REQUEST, message);
    }

    /** 401 未认证（前端据此触发无感刷新） */
    public static ServiceException unauthorized() {
        return new ServiceException(HttpStatus.UNAUTHORIZED, "Unauthorized Exception");
    }

    /** 403 禁止访问 */
    public static ServiceException forbidden() {
        return new ServiceException(HttpStatus.FORBIDDEN, "Forbidden Exception");
    }

    /** 403 禁止访问（自定义消息） */
    public static ServiceException forbidden(String message) {
        return new ServiceException(HttpStatus.FORBIDDEN, message);
    }
}
