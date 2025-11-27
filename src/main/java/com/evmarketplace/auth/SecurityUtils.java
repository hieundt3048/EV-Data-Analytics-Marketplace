
package com.evmarketplace.auth;
// Nhập lớp Claims từ thư viện JWT.
import io.jsonwebtoken.Claims;

// Nhập lớp HttpServletRequest từ API Servlet.
import javax.servlet.http.HttpServletRequest;
// Nhập các lớp List và ArrayList từ Java Collections Framework.
import java.util.ArrayList;
import java.util.List;

/**
 * Các tiện ích trợ giúp để đọc vai trò và thông tin xác thực từ request (được điền bởi JwtFilter).
 */
public class SecurityUtils {

    /**
     * Lấy danh sách các vai trò của người dùng từ một HttpServletRequest.
     * Thông tin này được trích xuất từ "authClaims" mà JwtFilter đã đặt vào request.
     * @param req Đối tượng HttpServletRequest.
     * @return Một danh sách các chuỗi đại diện cho vai trò của người dùng. Trả về danh sách rỗng nếu không tìm thấy.
     */
    @SuppressWarnings("unchecked") // Bỏ qua cảnh báo về việc ép kiểu không an toàn, vì chúng ta đã kiểm tra kiểu.
    public static List<String> getRolesFromRequest(HttpServletRequest req) {
        // Lấy thuộc tính "authClaims" từ request.
        Object c = req.getAttribute("authClaims");
        // Kiểm tra xem thuộc tính có phải là một instance của Claims không.
        if (c instanceof Claims) {
            Claims claims = (Claims) c;
            // Lấy claim có tên là "roles".
            Object rolesObj = claims.get("roles");
            // Kiểm tra xem claim "roles" có phải là một List không.
            if (rolesObj instanceof List) {
                // Nếu đúng, ép kiểu và trả về danh sách vai trò.
                return (List<String>) rolesObj;
            }
        }
        // Nếu không tìm thấy thông tin vai trò, trả về một danh sách rỗng.
        return new ArrayList<>();
    }

    /**
     * Lấy địa chỉ email của người dùng từ một HttpServletRequest.
     * Thông tin này được trích xuất từ "authClaims" mà JwtFilter đã đặt vào request.
     * @param req Đối tượng HttpServletRequest.
     * @return Chuỗi email của người dùng, hoặc null nếu không tìm thấy.
     */
    public static String getEmailFromRequest(HttpServletRequest req) {
        // Lấy thuộc tính "authClaims" từ request.
        Object c = req.getAttribute("authClaims");
        // Kiểm tra xem thuộc tính có phải là một instance của Claims không.
        if (c instanceof Claims) {
            Claims claims = (Claims) c;
            // Lấy claim có tên là "email".
            Object email = claims.get("email");
            // Nếu claim email tồn tại, chuyển đổi nó thành chuỗi và trả về. Ngược lại, trả về null.
            return email == null ? null : String.valueOf(email);
        }
        // Nếu không tìm thấy thông tin, trả về null.
        return null;
    }
}
