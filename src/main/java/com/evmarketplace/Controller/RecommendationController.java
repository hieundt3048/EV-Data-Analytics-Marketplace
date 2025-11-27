package com.evmarketplace.Controller;

import com.evmarketplace.Service.RecommendationService;
import com.evmarketplace.dto.RecommendationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cung cấp gợi ý dataset dựa trên AI.
 * Sử dụng collaborative filtering, content-based filtering và trending analysis
 * để đưa ra các đề xuất dataset phù hợp cho consumer.
 */
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    // Constructor injection: Spring tự động inject RecommendationService
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }
    
    /**
     * Lấy gợi ý dataset cá nhân hóa cho consumer đang đăng nhập.
     * Sử dụng hybrid approach: collaborative filtering + content-based + trending.
     * @param authentication Thông tin authentication của user.
     * @param limit Số lượng gợi ý (mặc định: 10).
     * @return List các dataset được gợi ý kèm điểm số.
     */
    @GetMapping("/personalized")
    // Temporarily remove role check for testing
    // @PreAuthorize("hasAnyRole('CONSUMER', 'USER')")
    public ResponseEntity<List<RecommendationDTO>> getPersonalizedRecommendations(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        
        // Trích xuất consumer ID từ authentication
        Long consumerId = extractConsumerId(authentication);
        
        // Gọi service để lấy personalized recommendations
        List<RecommendationDTO> recommendations = 
            recommendationService.getPersonalizedRecommendations(consumerId, limit);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Lấy danh sách dataset đang trending (phổ biến).
     * Public endpoint - không cần authentication.
     * Dựa trên số lượng mua trong 30 ngày qua.
     * @param limit Số lượng dataset trending (mặc định: 10).
     * @return List các dataset đang trending.
     */
    @GetMapping("/trending")
    public ResponseEntity<List<RecommendationDTO>> getTrendingDatasets(
            @RequestParam(defaultValue = "10") int limit) {
        
        // Lấy trending datasets (không cần consumerId)
        List<RecommendationDTO> trending = recommendationService.getTrendingDatasets(limit);
        return ResponseEntity.ok(trending);
    }
    
    /**
     * Lấy danh sách dataset tương tự với một dataset cụ thể.
     * Dựa trên category và các thuộc tính của dataset.
     * @param datasetId ID của dataset gốc cần tìm tương tự.
     * @param limit Số lượng dataset tương tự (mặc định: 5).
     * @return List các dataset tương tự.
     */
    @GetMapping("/similar/{datasetId}")
    public ResponseEntity<List<RecommendationDTO>> getSimilarDatasets(
            @PathVariable Long datasetId,
            @RequestParam(defaultValue = "5") int limit) {
        
        // Lấy similar datasets dựa trên content-based filtering
        List<RecommendationDTO> similar = 
            recommendationService.getSimilarDatasets(datasetId, limit);
        
        return ResponseEntity.ok(similar);
    }
    
    /**
     * Alias cho personalized recommendations với tên endpoint thân thiện hơn.
     * Chức năng giống getPersonalizedRecommendations().
     * @param authentication Thông tin authentication của user.
     * @param limit Số lượng gợi ý (mặc định: 10).
     * @return List các dataset được gợi ý.
     */
    @GetMapping("/for-you")
    // @PreAuthorize("hasAnyRole('CONSUMER', 'USER')")
    public ResponseEntity<List<RecommendationDTO>> getRecommendationsForYou(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        
        // Gọi lại getPersonalizedRecommendations
        return getPersonalizedRecommendations(authentication, limit);
    }
    
    /**
     * Helper method: Trích xuất consumer ID từ authentication object.
     * @param authentication Authentication object từ Spring Security.
     * @return Consumer ID.
     */
    private Long extractConsumerId(Authentication authentication) {
        // Placeholder - extract từ JWT token hoặc SecurityContext
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        return 1L; // Placeholder - trả về ID cố định cho testing
    }
}
