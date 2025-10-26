// Mục đích: Giao diện dịch vụ kiểm duyệt (ModerationService).
// Đáp ứng: Gửi sản phẩm lên quy trình kiểm duyệt/duyệt theo luồng admin.
package com.evmarketplace.Service;

public interface ModerationService {
    void submitForReview(java.util.UUID productId);
}
