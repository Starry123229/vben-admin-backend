package com.vben.backend.common.result;

import lombok.Data;

import java.util.List;

/**
 * 分页结果包裹：列表页统一返回 { items, total }，对齐前端表格组件约定。
 *
 * @author Starry
 */
@Data
public class PageResult<T> {

    /** 当前页数据 */
    private List<T> items;

    /** 总条数 */
    private long total;

    public PageResult(List<T> items, long total) {
        this.items = items;
        this.total = total;
    }
}
