package com.evmarketplace.provider;

import javax.persistence.*;
import com.evmarketplace.Pojo.User;

@Entity
@Table(name = "provider_datasets")
public class ProviderDataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String s3Url;
    private long sizeBytes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ProviderDataset() {
    }

    public ProviderDataset(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters và setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getS3Url() {
        return s3Url;
    }

    public void setS3Url(String s3Url) {
        this.s3Url = s3Url;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
