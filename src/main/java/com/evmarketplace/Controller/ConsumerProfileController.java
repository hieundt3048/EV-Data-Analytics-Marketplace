package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Repository.ConsumerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller quản lý profile của Consumer.
 * Cung cấp các API để xem, cập nhật thông tin cá nhân và demographics của consumer.
 */
@RestController
@RequestMapping("/api/consumer/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Cho phép CORS từ frontend
public class ConsumerProfileController {

    private final ConsumerRepository consumerRepository;

    // Constructor injection: Spring tự động inject ConsumerRepository
    public ConsumerProfileController(ConsumerRepository consumerRepository) {
        this.consumerRepository = consumerRepository;
    }

    /**
     * Lấy thông tin profile của consumer hiện tại.
     * @return Consumer object chứa thông tin profile.
     */
    @GetMapping
    public ResponseEntity<Consumer> getProfile() {
        // Lấy authentication từ SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build(); // 401 Unauthorized nếu chưa đăng nhập
        }

        // Lấy email từ authentication
        String email = auth.getName();
        Optional<Consumer> consumer = consumerRepository.findByEmail(email);
        
        // Trả về consumer nếu tìm thấy, ngược lại trả 404 Not Found
        return consumer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật thông tin profile của consumer.
     * Hỗ trợ cập nhật: name, organization, industry, region, companySize, useCaseType.
     * @param updates Map chứa các field cần cập nhật.
     * @return Map với success status và message.
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> updates) {
        // Lấy authentication từ SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build(); // 401 Unauthorized
        }

        String email = auth.getName();
        Optional<Consumer> consumerOpt = consumerRepository.findByEmail(email);
        
        if (consumerOpt.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 nếu không tìm thấy consumer
        }

        Consumer consumer = consumerOpt.get();

        // Cập nhật các trường cơ bản
        if (updates.containsKey("name")) {
            consumer.setName(updates.get("name"));
        }
        if (updates.containsKey("organization")) {
            consumer.setOrganization(updates.get("organization"));
        }

        // Cập nhật các trường demographics
        if (updates.containsKey("industry")) {
            consumer.setIndustry(updates.get("industry"));
        }
        if (updates.containsKey("region")) {
            consumer.setRegion(updates.get("region"));
        }
        if (updates.containsKey("companySize")) {
            consumer.setCompanySize(updates.get("companySize"));
        }
        if (updates.containsKey("useCaseType")) {
            consumer.setUseCaseType(updates.get("useCaseType"));
        }

        // Lưu consumer đã cập nhật vào database
        consumerRepository.save(consumer);

        // Tạo response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách các options có sẵn cho các trường demographics.
     * Sử dụng để hiển thị dropdown/select trong form cập nhật profile.
     * @return Map chứa arrays của options cho từng field (industries, regions, companySizes, useCaseTypes).
     */
    @GetMapping("/demographics-options")
    public ResponseEntity<Map<String, String[]>> getDemographicsOptions() {
        Map<String, String[]> options = new HashMap<>();
        
        // Danh sách các ngành công nghiệp
        options.put("industries", new String[]{
            "OEM (Original Equipment Manufacturer)",
            "Automotive Startup",
            "Research Institution",
            "Fleet Management",
            "Energy Provider",
            "Insurance Company",
            "Government Agency",
            "Consulting Firm",
            "Technology Company",
            "Other"
        });
        
        // Danh sách các khu vực địa lý
        options.put("regions", new String[]{
            "North America",
            "Europe",
            "Asia Pacific",
            "Latin America",
            "Middle East & Africa",
            "Other"
        });
        
        // Danh sách quy mô công ty
        options.put("companySizes", new String[]{
            "Small (1-50 employees)",
            "Medium (51-500 employees)",
            "Large (501+ employees)",
            "Enterprise (5000+ employees)"
        });
        
        // Danh sách các loại use case
        options.put("useCaseTypes", new String[]{
            "Research & Development",
            "Market Analysis",
            "Product Development",
            "Fleet Operations",
            "Infrastructure Planning",
            "Policy Making",
            "Academic Research",
            "Other"
        });
        
        return ResponseEntity.ok(options);
    }
}
