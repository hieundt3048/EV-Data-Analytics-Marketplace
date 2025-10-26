// Mục đích: Mô tả profile cho người tiêu thụ dữ liệu (ConsumerProfile).
// Đáp ứng: Lưu thông tin liên quan tới consumer (tổ chức/chi tiết liên lạc, thông tin thanh toán) theo yêu cầu sản phẩm.
package com.evmarketplace.Pojo;

import java.util.List;
import java.util.UUID;

public class ConsumerProfile {
    public UUID id;
    public UUID userId; // liên kết tới User
    public String organization;
    public String contactName;
    public String contactEmail;
    public String billingAccount;
    public List<UUID> apiKeys; // danh sách API key IDs (nếu quản lý riêng)

    public ConsumerProfile() {}

    // TODO: thêm annotation @Entity và các getter/setter khi chuyển sang JPA
}
