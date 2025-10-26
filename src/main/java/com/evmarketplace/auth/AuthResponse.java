package com.evmarketplace.auth;

/**
 * DTO for login response.
 */
public class AuthResponse {
    private String token;
    private SimpleUser user;

    public AuthResponse() {}

    public AuthResponse(String token, SimpleUser user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public SimpleUser getUser() {
        return user;
    }

    public void setUser(SimpleUser user) {
        this.user = user;
    }
}
