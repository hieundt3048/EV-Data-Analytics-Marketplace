// Mục đích: Mô hình người dùng (User) - một khung sườn đơn giản cho backend.
// Đáp ứng: Đại diện cho thực thể User trong sơ đồ lớp, được sử dụng cho việc xác thực và liên kết hồ sơ/khóa API.
package com.evmarketplace.Pojo;

// Nhập các annotation của JPA và các lớp collection.
import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Lớp thực thể User (JPA) - lưu trữ người dùng trong cơ sở dữ liệu.
 * Được chuyển đổi từ một POJO khung sườn thành một thực thể JPA hoàn chỉnh để việc xác thực
 * có thể duy trì và xác thực thông tin đăng nhập với cơ sở dữ liệu.
 */
@Entity // Đánh dấu lớp này là một thực thể JPA, có thể được ánh xạ tới một bảng trong CSDL.
@Table(name = "users", indexes = {@Index(columnList = "email", name = "idx_users_email")}) // Chỉ định tên bảng là "users" và tạo một chỉ mục (index) trên cột "email" để tăng tốc độ truy vấn.
public class User implements Serializable { // Implement Serializable để đối tượng có thể được tuần tự hóa.

    @Id // Đánh dấu trường này là khóa chính.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Cấu hình giá trị khóa chính được tạo tự động bởi CSDL (auto-increment).
    private Long id;

    @Column(nullable = false) // Cột này không được null.
    private String name; // Tên người dùng.

    @Column(nullable = false, unique = true) // Cột này không được null và mỗi giá trị phải là duy nhất.
    private String email; // Email người dùng, dùng để đăng nhập.

    @Column(nullable = false) // Cột này không được null.
    private String passwordHash; // Mật khẩu đã được băm của người dùng.

    @Column // Cột này có thể null.
    private String organization; // Tên tổ chức (dành cho nhà cung cấp).

    // Thiết lập mối quan hệ nhiều-nhiều (many-to-many) với thực thể Role.
    // FetchType.EAGER có nghĩa là khi tải một User, các Role liên quan cũng sẽ được tải ngay lập tức.
    @ManyToMany(fetch = FetchType.EAGER)
    // Định nghĩa bảng trung gian "user_roles" để quản lý mối quan hệ này.
    @JoinTable(
        name = "user_roles", // Tên bảng trung gian.
        joinColumns = @JoinColumn(name = "user_id"), // Cột trong bảng trung gian tham chiếu đến khóa chính của User.
        inverseJoinColumns = @JoinColumn(name = "role_id") // Cột trong bảng trung gian tham chiếu đến khóa chính của Role.
    )
    private Set<Role> roles = new HashSet<>(); // Một tập hợp các vai trò của người dùng.

    // Constructor mặc định, cần thiết cho JPA.
    public User() {}

    // Constructor để tạo người dùng mới với các thông tin cơ bản.
    public User(String name, String email, String passwordHash) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // --- Các phương thức Getter và Setter ---
    // Cung cấp quyền truy cập và sửa đổi các thuộc tính của đối tượng.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // Phương thức tiện ích để thêm một vai trò cho người dùng.
    public void addRole(Role r) {
        this.roles.add(r);
    }

    // Cột để theo dõi trạng thái phê duyệt của nhà cung cấp.
    // `columnDefinition = "BIT DEFAULT 0"` đặt giá trị mặc định trong CSDL là 0 (false).
    @Column(nullable = false, columnDefinition = "BIT DEFAULT 0")
    private boolean providerApproved = false; // Các tài khoản nhà cung cấp cần được admin phê duyệt.

    public boolean isProviderApproved() {
        return providerApproved;
    }

    public void setProviderApproved(boolean providerApproved) {
        this.providerApproved = providerApproved;
    }

    // Flag soft-delete cho người dùng. Đặt columnDefinition với DEFAULT để Hibernate có thể thêm cột
    @Column(nullable = false, columnDefinition = "BIT DEFAULT 0")
    private boolean deleted = false;
}
