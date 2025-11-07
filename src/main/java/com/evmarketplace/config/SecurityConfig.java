package com.evmarketplace.config;

import com.evmarketplace.auth.ApiKeyFilter;
import com.evmarketplace.auth.JwtFilter; // Filter tùy chỉnh để xử lý JWT.
import org.springframework.beans.factory.annotation.Autowired; // Annotation để tự động tiêm dependency.
import org.springframework.context.annotation.Bean; // Annotation để khai báo một bean trong Spring context.
import org.springframework.context.annotation.Configuration; // Đánh dấu lớp này là một lớp cấu hình Spring.
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity; // Kích hoạt các annotation bảo mật mức method như @PreAuthorize.
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Lớp để cấu hình bảo mật HTTP.
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Kích hoạt hỗ trợ bảo mật web của Spring Security.
import org.springframework.security.config.http.SessionCreationPolicy; // Enum để cấu hình chính sách tạo session.
import org.springframework.security.web.SecurityFilterChain; // Giao diện định nghĩa một chuỗi filter bảo mật.
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Filter mặc định cho xác thực username/password.
import org.springframework.web.cors.CorsConfiguration; // Lớp để cấu hình CORS.
import org.springframework.web.cors.CorsConfigurationSource; // Giao diện để cung cấp cấu hình CORS.
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Triển khai CorsConfigurationSource dựa trên URL.

import java.util.Arrays; // Lớp tiện ích cho mảng.

/**
 * Lớp cấu hình cho Spring Security.
 * Nó định nghĩa các quy tắc bảo mật cho ứng dụng, bao gồm CORS, CSRF, và ủy quyền request.
 */
@Configuration // Đánh dấu đây là một lớp cấu hình, nơi các bean có thể được định nghĩa.
@EnableWebSecurity // Kích hoạt các tính năng bảo mật web của Spring Security.
@EnableGlobalMethodSecurity(prePostEnabled = true) // Cho phép sử dụng @PreAuthorize trên controller/service.
public class SecurityConfig {

    // Tự động tiêm (inject) JwtFilter. Spring sẽ tìm một bean của JwtFilter và cung cấp nó.
    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private ApiKeyFilter apiKeyFilter;

    /**
     * Định nghĩa một bean SecurityFilterChain để cấu hình chuỗi filter bảo mật.
     * Đây là nơi chính để thiết lập các quy tắc bảo mật HTTP.
     * @param http Đối tượng HttpSecurity để xây dựng cấu hình.
     * @return Một SecurityFilterChain đã được xây dựng.
     * @throws Exception Nếu có lỗi xảy ra trong quá trình cấu hình.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Vô hiệu hóa CSRF (Cross-Site Request Forgery). Điều này là phổ biến cho các API stateless
                // nơi xác thực không dựa trên session cookie.
                .csrf(csrf -> csrf.disable())
                // Kích hoạt và cấu hình CORS (Cross-Origin Resource Sharing) bằng cách sử dụng bean corsConfigurationSource().
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Cấu hình ủy quyền cho các HTTP request.
                .authorizeHttpRequests(auth -> auth
                        // Cho phép tất cả các request đến các đường dẫn bắt đầu bằng "/api/auth/" và "/api/admin/login" mà không cần xác thực.
                        .antMatchers("/api/auth/**", "/api/admin/login").permitAll()
                        // Yêu cầu xác thực cho tất cả các request khác.
                        .anyRequest().authenticated()
                )
                // Cấu hình quản lý session.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); // Đặt chính sách là STATELESS vì chúng ta đang dùng JWT.

    // Thêm ApiKeyFilter vào chuỗi filter, chạy trước UsernamePasswordAuthenticationFilter.
    http.addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class);

        // Thêm JwtFilter của chúng ta vào trước filter UsernamePasswordAuthenticationFilter.
        // Điều này đảm bảo token JWT được xử lý trước khi Spring thử xác thực bằng username/password.
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // Xây dựng và trả về đối tượng SecurityFilterChain.
        return http.build();
    }

    /**
     * Định nghĩa một bean CorsConfigurationSource để cung cấp cấu hình CORS.
     * @return một nguồn cấu hình CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép các request từ nguồn gốc của frontend (máy chủ Vite).
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // Cho phép các phương thức HTTP này.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Cho phép tất cả các header trong request.
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Cho phép gửi thông tin xác thực (như cookie hoặc header Authorization).
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cấu hình CORS này cho tất cả các đường dẫn trong ứng dụng.
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}