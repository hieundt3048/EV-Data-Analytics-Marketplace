package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Double price;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private com.evmarketplace.Pojo.User user;

    @ManyToOne
    @JoinColumn(name = "dataset_id")
    private Dataset dataset;

    public Subscription() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public com.evmarketplace.Pojo.User getUser() { return user; }
    public void setUser(com.evmarketplace.Pojo.User user) { this.user = user; }
    public Dataset getDataset() { return dataset; }
    public void setDataset(Dataset dataset) { this.dataset = dataset; }
}
