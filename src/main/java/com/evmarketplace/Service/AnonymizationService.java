// Mục đích: Giao diện dịch vụ ẩn danh (AnonymizationService).
// Đáp ứng: Khởi tạo và quản lý các công việc ẩn danh cho sản phẩm dữ liệu theo yêu cầu bảo mật.
package com.evmarketplace.Service;

public interface AnonymizationService {
    void startJob(java.util.UUID productId);
}
