// Mục đích: Mô hình dữ liệu cho các đánh giá (Review) của người dùng đối với DataProduct.
// Đáp ứng: Thực hiện entity Review trong class diagram, dùng cho module marketplace và analytics.
package com.evmarketplace;

import java.util.Date;
import java.util.UUID;

public class Review {
    public UUID id;
    public UUID consumerId;
    public UUID productId;
    public int rating;
    public String comment;
    public Date createdAt;

    public Review() {}
}
