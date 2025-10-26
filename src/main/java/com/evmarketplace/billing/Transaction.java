// Mục đích: Mô hình giao dịch (Transaction) cho billing.
// Đáp ứng: Đại diện transaction/phiếu thanh toán, lưu provider share, platform fee, phương thức và trạng thái.
package com.evmarketplace.billing;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

public class Transaction {
    public UUID id;
    public UUID purchaseId;
    public UUID subscriptionId;
    public BigDecimal amount;
    public BigDecimal providerShare;
    public BigDecimal platformFee;
    public PaymentMethod method;
    public PaymentStatus status;
    public Date timestamp;

    public Transaction() {}
}
