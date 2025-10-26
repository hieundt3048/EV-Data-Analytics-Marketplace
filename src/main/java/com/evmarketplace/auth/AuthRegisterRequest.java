package com.evmarketplace.auth;

/**
 * DTO for registration requests.
 */
public class AuthRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String organization;
    private boolean wantsConsumer;
    private boolean wantsProvider;

    public AuthRegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public boolean isWantsConsumer() { return wantsConsumer; }
    public void setWantsConsumer(boolean wantsConsumer) { this.wantsConsumer = wantsConsumer; }
    public boolean isWantsProvider() { return wantsProvider; }
    public void setWantsProvider(boolean wantsProvider) { this.wantsProvider = wantsProvider; }
}
