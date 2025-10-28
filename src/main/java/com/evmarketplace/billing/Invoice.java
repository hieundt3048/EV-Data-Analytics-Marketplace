// Mục đích: Mô hình hóa hoá đơn (Invoice) liên kết với Transaction.
// Đáp ứng: Đại diện hoá đơn đầu ra (pdf) cho các giao dịch trong module billing.
package com.evmarketplace.billing;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.UUID;

/**
 * Thực thể JPA cho bảng hoa don ghi lại liên kết giữa giao dịch và file PDF.
 */
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id; // Khóa chính.

    @Column(name = "transaction_id", nullable = false, unique = true)
    private UUID transactionId; // Mỗi hóa đơn gắn với một giao dịch.

    @Column(name = "pdf_url")
    private String pdfUrl; // Đường dẫn tới file PDF hóa đơn.

    public Invoice() {
    }

    public Invoice(UUID transactionId, String pdfUrl) {
        this.transactionId = transactionId;
        this.pdfUrl = pdfUrl;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(UUID transactionId) {
        this.transactionId = transactionId;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    // TODO: generatePdf()
}
