package com.vben.backend.common.result;

import lombok.Getter;

/**
 * 统一响应包裹体：{ code, data, error, message }，code=0 成功 / -1 失败。
 *
 * @author Starry
 */
@Getter
public class R<T> {

    /** 业务码：0 成功 / -1 失败 */
    private final int code;

    /** 业务数据 */
    private final T data;

    /** 错误信息（失败时 error 与 message 同值，前端优先读 error） */
    private final String error;

    /** 提示信息 */
    private final String message;

    private R(int code, T data, String error, String message) {
        this.code = code;
        this.data = data;
        this.error = error;
        this.message = message;
    }

    /** 成功响应（data 可为 null） */
    public static <T> R<T> ok(T data) {
        return new R<>(ResultCode.SUCCESS.getCode(), data, null, ResultCode.SUCCESS.getMessage());
    }

    /** 成功响应（无数据） */
    public static <T> R<T> ok() {
        return ok(null);
    }

    /** 失败响应（code 恒为 -1） */
    public static <T> R<T> fail(String message) {
        return new R<>(ResultCode.FAILURE.getCode(), null, message, message);
    }
}
