// Khai báo package cho các lớp Repository.
package com.evmarketplace.Repository;

// Nhập các lớp cần thiết.
import com.evmarketplace.Pojo.User; // Lớp thực thể User.
import org.springframework.data.jpa.repository.JpaRepository; // Giao diện repository cơ bản của Spring Data JPA.

import java.util.List; // Danh sách kết quả truy vấn.
import java.util.Optional; // Lớp Optional để xử lý các giá trị có thể null một cách an toàn.

/**
 * Giao diện Repository cho thực thể User.
 * Spring Data JPA sẽ tự động tạo một bean triển khai giao diện này.
 * Nó cung cấp các phương thức CRUD (Create, Read, Update, Delete) cơ bản cho thực thể User.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository<User, Long> có nghĩa là repository này dành cho thực thể 'User' và kiểu dữ liệu của khóa chính là 'Long'.

    /**
     * Một phương thức truy vấn tùy chỉnh để tìm một người dùng bằng địa chỉ email của họ.
     * Spring Data JPA sẽ tự động tạo ra câu lệnh truy vấn dựa trên tên của phương thức này (query method).
     * @param email Email của người dùng cần tìm.
     * @return Một đối tượng Optional chứa người dùng nếu tìm thấy, hoặc rỗng nếu không.
     */
    Optional<User> findByEmail(String email);

    /**
     * Tìm tất cả người dùng có chứa vai trò với tên cụ thể.
     * @param roleName tên vai trò (ví dụ "Provider").
     * @return danh sách người dùng tương ứng.
     */
    List<User> findAllByRoles_Name(String roleName);
}
