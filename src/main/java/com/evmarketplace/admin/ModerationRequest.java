// Mục đích: Mô hình yêu cầu kiểm duyệt (ModerationRequest).
// Đáp ứng: Đại diện các yêu cầu moderation trong hệ thống admin theo class diagram.
package com.evmarketplace.admin;

import java.util.Date;
import java.util.UUID;

public class ModerationRequest {
    public UUID id;
    public UUID productId;
    public UUID adminId;
    public String status; // Use enum in future
    public String reason;
    public Date requestedAt;

    public ModerationRequest() {}

    // TODO: review()
}
