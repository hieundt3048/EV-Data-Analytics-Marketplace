package com.evmarketplace.billing;

/**
 * Enum định nghĩa các phương thức thanh toán được hỗ trợ trong hệ thống.
 * Sử dụng để xác định cách thức người dùng thanh toán khi mua dataset hoặc subscription.
 */
public enum PaymentMethod {
    CARD,           // Thanh toán bằng thẻ tín dụng/ghi nợ
    BANK_TRANSFER,  // Chuyển khoản ngân hàng
    WALLET          // Thanh toán qua ví điện tử
}
