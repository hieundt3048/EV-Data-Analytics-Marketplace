// Mục đích: Giao diện dịch vụ thanh toán (PaymentService).
// Đáp ứng: Xử lý thanh toán cho các Purchase, trả về Transaction để lưu trữ lịch sử billing.
package com.evmarketplace.Service;

import com.evmarketplace.billing.Transaction;
import com.evmarketplace.marketplace.Purchase;

public interface PaymentService {
    Transaction processPayment(Purchase purchase);
}
