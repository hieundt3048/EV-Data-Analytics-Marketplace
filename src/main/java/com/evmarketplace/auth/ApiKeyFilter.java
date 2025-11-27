package com.evmarketplace.auth;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Repository.APIKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

/**
 * Filter đơn giản để xác thực API Key trên các endpoint dữ liệu công khai (/api/v1/**).
 * - Nếu request vào đường dẫn /api/v1/** thì header X-API-Key là bắt buộc.
 * - Nếu key hợp lệ (có trong DB) thì request được tiếp tục.
 * - Nếu không hợp lệ hoặc thiếu thì trả 401.
 */
@Component
public class ApiKeyFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(ApiKeyFilter.class);

    private final APIKeyRepository apiKeyRepository;

    //Spring tự động inject APIKeyRepository
    public ApiKeyFilter(APIKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    /**
     * Phương thức filter được gọi một lần cho mỗi request.
     * Kiểm tra và xác thực API Key trước khi cho phép request tiếp tục.
     * @param request HttpServletRequest chứa thông tin request.
     * @param response HttpServletResponse để trả về kết quả.
     * @param filterChain FilterChain để chuyển request tiếp theo.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Lấy đường dẫn của request (ví dụ: /api/v1/datasets)
        String path = request.getRequestURI();

        // Áp dụng kiểm tra API key chỉ cho các endpoint API dữ liệu (đường dẫn API có phiên bản)
        if (path != null && path.startsWith("/api/v1")) {
            // Lấy API key từ header "X-API-Key"
            String key = request.getHeader("X-API-Key");
            
            logger.debug("=== API Key Filter Debug ===");
            logger.debug("Path: {}", path);
            logger.debug("API Key from header: {}", key);
            
            // Kiểm tra nếu thiếu API key hoặc rỗng
            if (key == null || key.trim().isEmpty()) {
                logger.debug("Missing X-API-Key for path {}", path);
                // Trả về lỗi 401 Unauthorized
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing API key");
                return; // Dừng xử lý request
            }

            // Tìm API key trong database
            Optional<APIKey> found = apiKeyRepository.findByKey(key);
            logger.debug("API Key found in DB: {}", found.isPresent());
            
            if (!found.isPresent()) {
                // Nếu không tìm thấy key trong DB (key không hợp lệ)
                logger.debug("Invalid API key for path {}", path);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid API key");
                return; // Dừng xử lý request
            }
            
            logger.debug("API Key valid, proceeding to controller");

            // Lưu đối tượng APIKey vào request attribute để sử dụng sau này
            request.setAttribute("apiKey", found.get());
        }

        // Cho phép request tiếp tục đến filter/controller tiếp theo
        filterChain.doFilter(request, response);
    }
}
