package com.vben.backend.module.system.util;

import com.vben.backend.common.result.ServiceException;

import java.util.regex.Pattern;

/**
 * 密码强度校验工具。
 *
 * <p>策略：最少 8 位，必须包含大小写字母 + 数字 + 特殊字符。
 * 可通过配置开关降级（如开发环境关闭）。
 *
 * @author Starry
 */
public final class PasswordValidator {

    /** 至少 8 位，包含大写、小写、数字、特殊字符 */
    private static final Pattern STRONG = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._\\-+#=]).{8,}$");

    /** 至少 6 位，包含字母 + 数字 */
    private static final Pattern MEDIUM = Pattern.compile(
            "^(?=.*[a-zA-Z])(?=.*\\d).{6,}$");

    private PasswordValidator() {
    }

    /**
     * 校验密码强度（严格模式）。
     *
     * @param password 待校验密码
     * @throws ServiceException 如果不符合要求
     */
    public static void validate(String password) {
        validate(password, false);
    }

    /**
     * 校验密码强度。
     *
     * @param password 待校验密码
     * @param lenient  宽松模式（最少 6 位 + 字母 + 数字）
     * @throws ServiceException 如果不符合要求
     */
    public static void validate(String password, boolean lenient) {
        if (password == null || password.isBlank()) {
            throw ServiceException.badRequest("密码不能为空");
        }
        if (password.length() > 64) {
            throw ServiceException.badRequest("密码长度不能超过 64 位");
        }
        Pattern pattern = lenient ? MEDIUM : STRONG;
        if (!pattern.matcher(password).matches()) {
            if (lenient) {
                throw ServiceException.badRequest("密码至少 6 位，且必须包含字母和数字");
            }
            throw ServiceException.badRequest("密码至少 8 位，且必须包含大小写字母、数字和特殊字符（@$!%*?&._-+#=）");
        }
    }
}
