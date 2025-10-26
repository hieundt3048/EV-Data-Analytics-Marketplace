package com.evmarketplace.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    // Lấy giá trị secret key từ file application.properties.
    // Nếu không có, giá trị mặc định là "changeitplease".
    @Value("${jwt.secret:changeitplease}")
    private String jwtSecret;

    // Lấy thời gian hết hạn của token (tính bằng giây) từ file application.properties.
    // Mặc định là 3600 giây (1 giờ).
    @Value("${jwt.expiration.seconds:3600}")
    private long jwtExpirationSeconds;

    // Khóa dùng để ký và xác thực token.
    private Key signingKey;

    // Phương thức này được Spring gọi sau khi tất cả các dependency đã được inject.
    // Dùng để khởi tạo các giá trị cần thiết.
    @PostConstruct
    public void init() {
        // Tạo signingKey từ chuỗi secret.
        signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Phương thức để tạo ra một JWT token.
    public String generateToken(String name, String email, List<String> roles) {
        long now = System.currentTimeMillis(); // Lấy thời gian hiện tại.
        // Sử dụng JwtBuilder để xây dựng token.
        JwtBuilder b = Jwts.builder()
                .setSubject(email) // Đặt "subject" của token là email (thông tin chính).
                .claim("name", name) // Thêm "claim" (thông tin) tên người dùng.
                .claim("roles", roles) // Thêm "claim" danh sách vai trò.
                .setIssuedAt(new Date(now)) // Đặt thời gian phát hành token.
                .setExpiration(new Date(now + jwtExpirationSeconds * 1000)) // Đặt thời gian hết hạn.
                .signWith(signingKey, SignatureAlgorithm.HS256); // Ký token bằng thuật toán HS256.
        return b.compact(); // Hoàn thành và trả về chuỗi token.
    }

    // Phương thức để xác thực và giải mã một token.
    public Jws<Claims> validateToken(String token) throws JwtException {
        // Sử dụng parser để phân tích token, dùng cùng một signingKey để xác thực chữ ký.
        // Nếu token không hợp lệ (sai chữ ký, hết hạn, v.v.), nó sẽ ném ra một JwtException.
        return Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
    }

}
