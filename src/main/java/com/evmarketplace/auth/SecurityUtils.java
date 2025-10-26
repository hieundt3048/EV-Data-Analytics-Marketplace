package com.evmarketplace.auth;

import io.jsonwebtoken.Claims;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper utilities to read roles and auth info from request (populated by JwtFilter).
 */
public class SecurityUtils {

    @SuppressWarnings("unchecked")
    public static List<String> getRolesFromRequest(HttpServletRequest req) {
        Object c = req.getAttribute("authClaims");
        if (c instanceof Claims) {
            Claims claims = (Claims) c;
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof List) {
                return (List<String>) rolesObj;
            }
        }
        return new ArrayList<>();
    }

    public static String getEmailFromRequest(HttpServletRequest req) {
        Object c = req.getAttribute("authClaims");
        if (c instanceof Claims) {
            Claims claims = (Claims) c;
            Object email = claims.get("email");
            return email == null ? null : String.valueOf(email);
        }
        return null;
    }
}
