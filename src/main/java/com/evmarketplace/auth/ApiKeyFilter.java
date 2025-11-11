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

    public ApiKeyFilter(APIKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Apply API key check only to data API endpoints (versioned API path)
        if (path != null && path.startsWith("/api/v1")) {
            String key = request.getHeader("X-API-Key");
            if (key == null || key.trim().isEmpty()) {
                logger.debug("Missing X-API-Key for path {}", path);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing API key");
                return;
            }

            Optional<APIKey> found = apiKeyRepository.findByKey(key);
            if (!found.isPresent()) {
                logger.debug("Invalid API key for path {}", path);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid API key");
                return;
            }

            // attach the APIKey object for downstream handlers if needed
            request.setAttribute("apiKey", found.get());
        }

        filterChain.doFilter(request, response);
    }
}
