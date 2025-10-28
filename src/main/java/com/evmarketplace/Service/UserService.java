// Khai báo package cho các lớp Service.
package com.evmarketplace.Service;

// Nhập các lớp cần thiết.
import com.evmarketplace.Pojo.User; // Lớp thực thể User.
import com.evmarketplace.Repository.UserRepository; // Repository để tương tác với bảng User.
import com.evmarketplace.Pojo.Role; // Lớp thực thể Role.
import com.evmarketplace.Repository.RoleRepository; // Repository để tương tác với bảng Role.
import com.evmarketplace.Repository.DataProviderRepository;
import org.springframework.security.crypto.bcrypt.BCrypt; // Thư viện để băm và kiểm tra mật khẩu.
import org.springframework.stereotype.Service; // Đánh dấu lớp này là một Service trong Spring.
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Lớp Service xử lý logic nghiệp vụ liên quan đến người dùng.
 * Nó hoạt động như một lớp trung gian giữa Controller và Repository.
 */
@Service // Đánh dấu lớp này là một Spring Service component.
public class UserService {

    // Khai báo các repository cần thiết. `final` để đảm bảo chúng được khởi tạo một lần.
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DataProviderRepository dataProviderRepository;

    // Constructor injection: Spring sẽ tự động tiêm các dependency (UserRepository, RoleRepository).
    public UserService(UserRepository userRepository, RoleRepository roleRepository, DataProviderRepository dataProviderRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.dataProviderRepository = dataProviderRepository;
    }

    /**
     * Đăng ký một người dùng mới.
     * @param name Tên người dùng.
     * @param email Email người dùng.
     * @param rawPassword Mật khẩu chưa được băm.
     * @return Đối tượng User đã được lưu vào cơ sở dữ liệu.
     */
    public User register(String name, String email, String rawPassword) {
        // Băm mật khẩu bằng BCrypt với salt được tạo ngẫu nhiên (độ phức tạp là 10).
        String hashed = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        // Tạo một đối tượng User mới.
        User u = new User(name, email, hashed);
        // Lưu người dùng vào cơ sở dữ liệu và trả về đối tượng đã được lưu.
        return userRepository.save(u);
    }

    /**
     * Nạp chồng (overload) phương thức đăng ký để chấp nhận thêm thông tin về tổ chức và trạng thái phê duyệt.
     * @param name Tên người dùng.
     * @param email Email người dùng.
     * @param rawPassword Mật khẩu chưa được băm.
     * @param organization Tên tổ chức.
     * @param providerApproved Trạng thái phê duyệt của nhà cung cấp.
     * @return Đối tượng User đã được lưu.
     */
    public User register(String name, String email, String rawPassword, String organization, boolean providerApproved) {
        String hashed = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        User u = new User(name, email, hashed);
        u.setOrganization(organization);
        u.setProviderApproved(providerApproved);
        return userRepository.save(u);
    }

    /**
     * Tìm một người dùng bằng email.
     * @param email Email cần tìm.
     * @return Một Optional chứa User nếu tìm thấy, hoặc rỗng nếu không.
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Lấy danh sách tất cả người dùng.
     * @return Một danh sách các đối tượng User.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String roleName) {
        return userRepository.findAllByRoles_Name(roleName);
    }

    /**
     * Phê duyệt một tài khoản nhà cung cấp.
     * @param userId ID của người dùng cần phê duyệt.
     * @return Đối tượng User sau khi cập nhật.
     */
    public User approveProvider(Long userId) {
        return userRepository.findById(userId).map(u -> {
            u.setProviderApproved(true);
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUser(Long userId, String name, String organization, Boolean providerApproved, List<String> roleNames) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (name != null) {
            user.setName(name);
        }
        if (organization != null) {
            user.setOrganization(organization);
        }
        if (providerApproved != null) {
            user.setProviderApproved(providerApproved);
        }
        if (roleNames != null) {
        Set<Role> newRoles = roleNames.stream()
            .filter(r -> r != null && !r.trim().isEmpty())
            .map(String::trim)
                    .map(this::resolveRole)
                    .collect(Collectors.toSet());
            user.setRoles(newRoles);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        dataProviderRepository.findByUser(user).ifPresent(dataProviderRepository::delete);
        userRepository.delete(user);
    }

    /**
     * Lấy danh sách vai trò của một người dùng.
     * @param user Đối tượng User.
     * @return Một Set các đối tượng Role.
     */
    public Set<Role> getRolesForUser(User user) {
        if (user == null) return java.util.Collections.emptySet(); // Trả về set rỗng nếu user là null.
        Set<Role> roles = user.getRoles();
        // Một số dòng dữ liệu cũ có thể để null trường roles, ta trả về set rỗng để tránh NullPointerException.
        return roles == null ? java.util.Collections.emptySet() : roles;
    }

    /**
     * Gán một vai trò cho người dùng.
     * @param user Người dùng cần gán vai trò.
     * @param roleName Tên của vai trò cần gán.
     */
    public void assignRoleToUser(User user, String roleName) {
        if (user == null) return; // Không làm gì nếu user là null.
        // Tìm vai trò theo tên. Nếu không tồn tại, tạo mới và lưu vào CSDL.
        Role r = roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
        user.addRole(r); // Thêm vai trò cho người dùng.
        userRepository.save(user); // Lưu lại thông tin người dùng với vai trò mới.
    }

    /**
     * Kiểm tra xem mật khẩu chưa băm có khớp với mật khẩu đã băm của người dùng không.
     * @param user Đối tượng User.
     * @param rawPassword Mật khẩu chưa băm để kiểm tra.
     * @return true nếu mật khẩu khớp, ngược lại là false.
     */
    public boolean checkPassword(User user, String rawPassword) {
        if (user == null || user.getPasswordHash() == null) return false; // Trả về false nếu user hoặc hash là null.
        try {
            // Sử dụng BCrypt để so sánh mật khẩu.
            return BCrypt.checkpw(rawPassword, user.getPasswordHash());
        } catch (IllegalArgumentException ex) {
            // Khi mật khẩu trong cơ sở dữ liệu không ở định dạng BCrypt hợp lệ
            // (vd: dữ liệu cũ lưu mật khẩu dạng plaintext), sẽ ném ngoại lệ.
            // Ta coi như mật khẩu không khớp và ghi log để có thể xử lý dữ liệu cũ.
            org.slf4j.LoggerFactory.getLogger(UserService.class)
                    .warn("Stored password for user {} is not a valid BCrypt hash", user.getEmail(), ex);
            // Hỗ trợ tương thích ngược: nếu mật khẩu lưu là plaintext và khớp, tự động chuyển sang BCrypt.
            if (rawPassword.equals(user.getPasswordHash())) {
                String newHash = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
                user.setPasswordHash(newHash);
                userRepository.save(user);
                return true;
            }
            return false;
        }
    }

    private Role resolveRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }
}
