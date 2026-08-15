package com.vben.backend.config;

import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理：统一转为「HTTP 状态码 + code:-1 包裹体」，禁止堆栈出站。
 *
 * @author Starry
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常：按异常携带的状态码返回 */
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<R<Void>> handleService(ServiceException e) {
        return ResponseEntity.status(e.getStatus()).body(R.fail(e.getMessage()));
    }

    /** 参数校验失败：400 + 首条校验消息 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<R<Void>> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
                .orElse("参数校验失败");
        return ResponseEntity.badRequest().body(R.fail(msg));
    }

    /** 静态资源 404 */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<R<Void>> handleNotFound(NoResourceFoundException e) {
        return ResponseEntity.status(404).body(R.fail("Not Found"));
    }

    /** 兜底：500，仅记日志，不泄漏内部细节 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<R<Void>> handleOther(Exception e) {
        log.error("未捕获异常", e);
        return ResponseEntity.internalServerError().body(R.fail("服务器内部错误"));
    }
}
