package com.vben.backend.config;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;
import com.vben.backend.common.result.R;
import com.vben.backend.common.result.ServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
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

    /** Sa-Token 未登录：401（前端据此触发无感刷新，契约必需） */
    @ExceptionHandler(NotLoginException.class)
    public ResponseEntity<R<Void>> handleNotLogin(NotLoginException e) {
        return ResponseEntity.status(401).body(R.fail("Unauthorized Exception"));
    }

    /** Sa-Token 无角色：403 */
    @ExceptionHandler(NotRoleException.class)
    public ResponseEntity<R<Void>> handleNotRole(NotRoleException e) {
        return ResponseEntity.status(403).body(R.fail("无权限执行此操作"));
    }

    /** Sa-Token 无权限点：403 */
    @ExceptionHandler(NotPermissionException.class)
    public ResponseEntity<R<Void>> handleNotPermission(NotPermissionException e) {
        return ResponseEntity.status(403).body(R.fail("无权限执行此操作"));
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

    /** 缺少必填请求参数：400（原先落到兜底 500，语义不对） */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<R<Void>> handleMissingParam(MissingServletRequestParameterException e) {
        return ResponseEntity.badRequest().body(R.fail("缺少请求参数: " + e.getParameterName()));
    }

    /** multipart 请求缺少指定文件部件：400 */
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<R<Void>> handleMissingPart(MissingServletRequestPartException e) {
        return ResponseEntity.badRequest().body(R.fail("缺少上传文件: " + e.getRequestPartName()));
    }

    /** 静态资源 404 */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<R<Void>> handleNotFound(NoResourceFoundException e) {
        return ResponseEntity.status(404).body(R.fail("Not Found"));
    }

    /** 请求体不可读（JSON 语法错误/请求体缺失）：400（原落到兜底 500） */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<R<Void>> handleNotReadable(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(R.fail("请求体格式错误"));
    }

    /** 参数类型/格式不匹配（如时间参数非法）：400（原落到兜底 500） */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<R<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest().body(R.fail("参数格式错误: " + e.getName()));
    }

    /** 请求不是 multipart/form-data（上传接口未带文件部件）：400（原落到兜底 500） */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<R<Void>> handleMultipart(MultipartException e) {
        return ResponseEntity.badRequest().body(R.fail("上传请求格式错误，请使用 multipart/form-data"));
    }

    /** 数据库唯一约束/完整性冲突：400（避免唯一键冲突以 500 暴露） */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<R<Void>> handleDataIntegrity(DataIntegrityViolationException e) {
        log.warn("数据完整性冲突: {}", e.getMessage());
        return ResponseEntity.badRequest().body(R.fail("数据已存在或违反唯一约束"));
    }

    /** 兜底：500，仅记日志，不泄漏内部细节 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<R<Void>> handleOther(Exception e) {
        log.error("未捕获异常", e);
        return ResponseEntity.internalServerError().body(R.fail("服务器内部错误"));
    }
}
