package com.evmarketplace.auth;

import io.jsonwebtoken.Claims; // Đại diện cho các "claims" (thông tin) trong một JWT.
import io.jsonwebtoken.Jws; // Đại diện cho một JWT đã được ký và xác thực.
import io.jsonwebtoken.JwtException; // Exception cho các lỗi liên quan đến JWT.
import org.slf4j.Logger; // Giao diện ghi log.
import org.slf4j.LoggerFactory; // Factory để tạo các instance của Logger.
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // Đánh dấu lớp này là một Spring component để được tự động phát hiện.

import javax.servlet.FilterChain; // Chuỗi các filter trong một request.
import javax.servlet.ServletException; // Exception cho các lỗi servlet.
import javax.servlet.http.HttpServletRequest; // Đại diện cho một yêu cầu HTTP.
import javax.servlet.http.HttpServletResponse; // Đại diện cho một phản hồi HTTP.
import javax.servlet.Filter; // Giao diện cơ bản cho các filter.
import javax.servlet.ServletRequest; // Giao diện chung cho một request.
import javax.servlet.ServletResponse; // Giao diện chung cho một response.
import java.io.IOException; // Exception cho các lỗi I/O.
import java.util.Collections;
import java.util.List; // Giao diện List của Java.
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Bộ lọc JWT đơn giản: xác thực token "Authorization Bearer" và lưu trữ các claims trong thuộc tính request "authClaims".
 */
@Component // Đánh dấu lớp này là một Spring component, cho phép Spring quản lý nó như một bean.
public class JwtFilter implements Filter {

    // Logger để ghi lại các thông điệp.
    private final Logger logger = LoggerFactory.getLogger(JwtFilter.class);
    // Tiện ích để xử lý JWT (tạo, xác thực).
    private final JwtUtil jwtUtil;

    // Constructor injection: Spring sẽ tiêm một instance của JwtUtil vào đây.
    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Phương thức chính của filter, được gọi cho mỗi yêu cầu HTTP.
     * @param request Đối tượng request đến.
     * @param response Đối tượng response sẽ được gửi đi.
     * @param chain Chuỗi filter, để chuyển yêu cầu đến filter tiếp theo hoặc servlet.
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Lấy đường dẫn URI của yêu cầu.
        String path = req.getRequestURI();
        // Bỏ qua xác thực cho các endpoint công khai, đăng nhập admin, tài nguyên tĩnh và API v1 (dùng API Key)
        if (path.startsWith("/api/auth") || 
            path.startsWith("/api/admin/login") || 
            path.startsWith("/api/v1") ||  // THÊM: Skip JWT cho API v1 (dùng API Key)
            path.startsWith("/public") || 
            path.startsWith("/static")) {
            // Nếu là đường dẫn công khai, chuyển yêu cầu đến filter tiếp theo mà không cần xác thực.
            chain.doFilter(request, response);
            return;
        }

        // Lấy header "Authorization" từ yêu cầu.
        String auth = req.getHeader("Authorization");
        // Kiểm tra xem header có tồn tại và có bắt đầu bằng "Bearer " không.
        if (auth != null && auth.startsWith("Bearer ")) {
            // Trích xuất token bằng cách loại bỏ tiền tố "Bearer ".
            String token = auth.substring(7);
            try {
                // Xác thực token bằng JwtUtil.
                Jws<Claims> claims = jwtUtil.validateToken(token);
                Claims body = claims.getBody();
                // Nếu token hợp lệ, lưu các claims vào thuộc tính của request để các controller sau có thể sử dụng.
                req.setAttribute("authClaims", body);

                // Thiết lập Authentication cho Spring Security để @PreAuthorize hoạt động dựa trên vai trò.
                List<String> roleNames = extractRoleNames(body);
                List<GrantedAuthority> authorities = roleNames.stream()
                        .filter(Objects::nonNull)
                        .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        body.getSubject(),
                        null,
                        authorities
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException ex) {
                // Nếu token không hợp lệ, ghi lại cảnh báo và gửi lỗi 401 Unauthorized.
                logger.warn("JWT không hợp lệ: {}", ex.getMessage());
                SecurityContextHolder.clearContext();
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return; // Dừng xử lý yêu cầu.
            }
        } else {
            // Nếu không có token được cung cấp cho các endpoint được bảo vệ, gửi lỗi 401 Unauthorized.
            SecurityContextHolder.clearContext();
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return; // Dừng xử lý yêu cầu.
        }

        // Nếu xác thực thành công, chuyển yêu cầu đến filter tiếp theo trong chuỗi.
        chain.doFilter(request, response);
    }

    private List<String> extractRoleNames(Claims claims) {
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?>) {
            return ((List<?>) rolesObj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }
}
