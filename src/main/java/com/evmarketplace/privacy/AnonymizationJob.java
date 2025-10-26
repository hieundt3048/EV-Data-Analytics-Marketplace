// Mục đích: Mô tả công việc ẩn danh (AnonymizationJob) cho dữ liệu.
// Đáp ứng: Thực hiện workflow ẩn danh/hoạt động tuân thủ của class diagram (queue/run/complete).
package com.evmarketplace.privacy;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public class AnonymizationJob {
    public UUID id;
    public UUID productId;
    public List<String> rules;
    public JobStatus status;
    public Date startedAt;
    public Date finishedAt;

    public AnonymizationJob() {}

    // TODO: run()
}
