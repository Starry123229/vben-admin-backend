package com.vben.backend.module.system.util;

import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Excel 导出工具：基于 Apache POI，生成 .xlsx 文件并写入 HttpServletResponse。
 *
 * @author Starry
 */
public final class ExcelUtils {

    private ExcelUtils() {
    }

    /**
     * 导出 Excel。
     *
     * @param response  HttpServletResponse
     * @param fileName  下载文件名（不含扩展名）
     * @param headers   表头列表（有序）
     * @param data      数据行：每行为 Map<表头, 值>
     */
    public static void export(HttpServletResponse response,
                              String fileName,
                              List<String> headers,
                              List<Map<String, Object>> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(fileName);

            // 表头样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // 写表头
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                var cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }

            // 写数据行
            for (int i = 0; i < data.size(); i++) {
                Row row = sheet.createRow(i + 1);
                Map<String, Object> rowData = data.get(i);
                for (int j = 0; j < headers.size(); j++) {
                    var cell = row.createCell(j);
                    Object val = rowData.get(headers.get(j));
                    cell.setCellValue(val == null ? "" : String.valueOf(val));
                }
            }

            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("UTF-8");
            String encodedFileName = URLEncoder.encode(fileName + ".xlsx", StandardCharsets.UTF_8);
            response.setHeader("Content-Disposition", "attachment; filename=" + encodedFileName);
            response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

            try (OutputStream os = response.getOutputStream()) {
                workbook.write(os);
                os.flush();
            }
        }
    }
}
