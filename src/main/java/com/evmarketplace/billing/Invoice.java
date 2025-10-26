// Mục đích: Mô hình hóa hoá đơn (Invoice) liên kết với Transaction.
// Đáp ứng: Đại diện hoá đơn đầu ra (pdf) cho các giao dịch trong module billing.
package com.evmarketplace.billing;

import java.util.UUID;

public class Invoice {
    public UUID id;
    public UUID transactionId;
    public String pdfUrl;

    public Invoice() {}

    // TODO: generatePdf()
}
