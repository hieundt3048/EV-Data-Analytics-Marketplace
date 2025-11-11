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
 * Controller for Consumer profile management including demographics
 */
@RestController
@RequestMapping("/api/consumer/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ConsumerProfileController {

    private final ConsumerRepository consumerRepository;

    public ConsumerProfileController(ConsumerRepository consumerRepository) {
        this.consumerRepository = consumerRepository;
    }

    /**
     * GET /api/consumer/profile
     * Get current consumer profile
     */
    @GetMapping
    public ResponseEntity<Consumer> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String email = auth.getName();
        Optional<Consumer> consumer = consumerRepository.findByEmail(email);
        
        return consumer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/consumer/profile
     * Update consumer profile including demographics
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> updates) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String email = auth.getName();
        Optional<Consumer> consumerOpt = consumerRepository.findByEmail(email);
        
        if (consumerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Consumer consumer = consumerOpt.get();

        // Update basic fields
        if (updates.containsKey("name")) {
            consumer.setName(updates.get("name"));
        }
        if (updates.containsKey("organization")) {
            consumer.setOrganization(updates.get("organization"));
        }

        // Update demographics fields
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

        consumerRepository.save(consumer);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/consumer/profile/demographics-options
     * Get available options for demographics fields
     */
    @GetMapping("/demographics-options")
    public ResponseEntity<Map<String, String[]>> getDemographicsOptions() {
        Map<String, String[]> options = new HashMap<>();
        
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
        
        options.put("regions", new String[]{
            "North America",
            "Europe",
            "Asia Pacific",
            "Latin America",
            "Middle East & Africa",
            "Other"
        });
        
        options.put("companySizes", new String[]{
            "Small (1-50 employees)",
            "Medium (51-500 employees)",
            "Large (501+ employees)",
            "Enterprise (5000+ employees)"
        });
        
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
