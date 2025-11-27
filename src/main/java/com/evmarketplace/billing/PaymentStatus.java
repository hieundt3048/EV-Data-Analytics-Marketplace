package com.evmarketplace.billing;

/**
 * Enum định nghĩa các trạng thái của giao dịch thanh toán trong hệ thống.
 * Sử dụng để theo dõi vòng đời của một giao dịch từ khi khởi tạo đến hoàn tất hoặc thất bại.
 */
public enum PaymentStatus {
    PENDING,   // Đang chờ xử lý - giao dịch vừa được tạo nhưng chưa hoàn tất
    SUCCESS,   // Thanh toán thành công - tiền đã được trừ và xác nhận
    FAILED,    // Thanh toán thất bại - giao dịch không thành công (thiếu tiền, thẻ hết hạn, etc.)
    REFUNDED   // Đã hoàn tiền - giao dịch đã được hoàn lại cho người mua
}
