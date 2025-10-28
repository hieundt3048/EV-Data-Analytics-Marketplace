// Khai báo package cho các lớp tiện ích.
package com.evmarketplace.utils;

// Nhập các lớp cần thiết cho việc xử lý ngày tháng.
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Lớp chứa các phương thức tiện ích tĩnh có thể tái sử dụng trong toàn bộ ứng dụng.
 */
public class Utils {

    /**
     * Kiểm tra xem một chuỗi có phải là địa chỉ email hợp lệ hay không.
     * @param email Chuỗi email cần kiểm tra.
     * @return true nếu email hợp lệ, ngược lại là false.
     */
    public static boolean validateEmail(String email) {
        // Nếu email là null hoặc rỗng, nó không hợp lệ.
        if (email == null || email.isEmpty()) {
            return false;
        }
        // Biểu thức chính quy (regex) để kiểm tra định dạng email tiêu chuẩn.
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        // So khớp chuỗi email với regex và trả về kết quả.
        return email.matches(emailRegex);
    }

    /**
     * Định dạng một chuỗi dữ liệu bằng cách loại bỏ khoảng trắng ở đầu và cuối.
     * @param data Chuỗi dữ liệu cần định dạng.
     * @return Chuỗi đã được định dạng, hoặc null nếu đầu vào là null.
     */
    public static String formatData(String data) {
        // Nếu dữ liệu đầu vào là null, trả về null.
        if (data == null) {
            return null;
        }
        // Loại bỏ khoảng trắng ở đầu và cuối chuỗi.
        return data.trim();
    }

    /**
     * Chuyển đổi một chuỗi thành đối tượng LocalDate.
     * @param dateStr Chuỗi ngày tháng cần chuyển đổi (ví dụ: "2025-10-28").
     * @return Một đối tượng LocalDate nếu chuyển đổi thành công, hoặc null nếu chuỗi đầu vào là null.
     * @throws DateTimeParseException nếu chuỗi không thể được phân tích cú pháp thành một ngày hợp lệ.
     */
    public static LocalDate parseDate(String dateStr) throws DateTimeParseException {
        // Nếu chuỗi ngày là null, trả về null.
        if (dateStr == null) {
            return null;
        }
        // Sử dụng phương thức parse của LocalDate để chuyển đổi chuỗi.
        return LocalDate.parse(dateStr);
    }
}
