// Khai báo package cho các lớp Pojo (Plain Old Java Object).
package com.evmarketplace.Pojo;

// Nhập các annotation của JPA (Java Persistence API) và interface Serializable.
import javax.persistence.*;
import java.io.Serializable;

/**
 * Lớp thực thể Role cho RBAC (Role-Based Access Control - Kiểm soát truy cập dựa trên vai trò).
 * Ví dụ: Consumer (Người tiêu dùng), Provider (Nhà cung cấp), Admin (Quản trị viên).
 */
@Entity // Đánh dấu lớp này là một thực thể JPA, có thể được ánh xạ tới một bảng trong cơ sở dữ liệu.
@Table(name = "roles") // Chỉ định tên của bảng trong cơ sở dữ liệu là "roles".
public class Role implements Serializable { // Implement Serializable để đối tượng có thể được tuần tự hóa.

    // Đánh dấu trường này là khóa chính của bảng.
    @Id
    // Cấu hình cách tạo giá trị cho khóa chính. IDENTITY có nghĩa là cơ sở dữ liệu sẽ tự động tăng giá trị (auto-increment).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Trường ID của vai trò, kiểu Long.

    // Cấu hình cột trong bảng. `nullable = false` nghĩa là cột này không được để trống.
    // `unique = true` nghĩa là mỗi giá trị trong cột này phải là duy nhất.
    @Column(nullable = false, unique = true)
    private String name; // Tên của vai trò (ví dụ: "Admin", "Consumer").

    // Constructor mặc định. JPA yêu cầu một constructor không tham số.
    public Role() {}

    // Constructor để tạo một vai trò mới với một tên cụ thể.
    public Role(String name) { this.name = name; }

    // --- Các phương thức Getter và Setter ---
    // Cung cấp cách để truy cập và thay đổi các thuộc tính của đối tượng từ bên ngoài.

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
// Kết thúc lớp thực thể Role.
