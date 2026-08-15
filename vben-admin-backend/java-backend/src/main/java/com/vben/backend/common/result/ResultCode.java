package com.vben.backend.common.result;

import lombok.Getter;

/**
 * 业务码：0 成功 / -1 失败；HTTP 状态码是独立通道。
 *
 * @author Starry
 */
@Getter
public enum ResultCode {

    /** 成功 */
    SUCCESS(0, "ok"),

    /** 失败（body 中 code 恒为 -1，对齐 mock 契约） */
    FAILURE(-1, "业务处理失败");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
