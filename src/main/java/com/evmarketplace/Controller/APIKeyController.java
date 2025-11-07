package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Repository.APIKeyRepository;
import com.evmarketplace.Repository.UserRepository; // THÊM IMPORT
import com.evmarketplace.Pojo.User; // THÊM IMPORT
import com.evmarketplace.dto.APIKeyRequestDTO;
import com.evmarketplace.dto.APIKeyResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/apikeys")
@CrossOrigin(origins = "http://localhost:5173")
public class APIKeyController {

    private final APIKeyRepository apiKeyRepository;
    private final UserRepository userRepository; // THÊM DEPENDENCY

    // THÊM CONSTRUCTOR VỚI userRepository
    public APIKeyController(APIKeyRepository apiKeyRepository, UserRepository userRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate")
    public ResponseEntity<APIKeyResponseDTO> generateApiKey(@Valid @RequestBody APIKeyRequestDTO request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String currentUserEmail = authentication.getName();
            
            // Tìm user hiện tại - ĐÃ SỬA LỖI
            Optional<User> currentUser = userRepository.findByEmail(currentUserEmail);
            if (currentUser.isEmpty()) {
                return ResponseEntity.status(401).build();
            }
            
        // Generate API key
        String generatedKey = "evmkt_" + UUID.randomUUID().toString().replace("-", "");
        
        // Tạo UUID từ user ID thay vì random
        UUID consumerId = UUID.nameUUIDFromBytes(currentUser.get().getId().toString().getBytes());
        
        // Create and save the API key
        APIKey apiKey = new APIKey(consumerId, generatedKey);
        apiKey.setRateLimit(1000);
        apiKeyRepository.save(apiKey);
        
        APIKeyResponseDTO response = new APIKeyResponseDTO();
        response.setKey(generatedKey);
        response.setConsumerId(consumerId);
        response.setMessage("API key generated successfully");
        
        return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Giữ endpoint cũ cho tương thích
    @PostMapping
    public ResponseEntity<APIKeyResponseDTO> generateApiKeyLegacy(@Valid @RequestBody APIKeyRequestDTO request) {
        return generateApiKey(request);
    }
}