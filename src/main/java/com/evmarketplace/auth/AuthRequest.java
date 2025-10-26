package com.evmarketplace.auth;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

/**
 * DTO for login request payload.
 */
public class AuthRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    public AuthRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
