// Mục đích: Mô hình sản phẩm dữ liệu (DataProduct).
// Đáp ứng: Đại diện DataProduct theo class diagram, chứa metadata, loại dữ liệu, định dạng, kích thước và trạng thái.
package com.evmarketplace.data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public class DataProduct {
    public UUID id;
    public UUID providerId;
    public String title;
    public String description;
    public List<String> categories;
    public List<String> tags;
    public DataType dataType;
    public Format format;
    public long sizeBytes;
    public String region;
    public Date startTime;
    public Date endTime;
    public ProductStatus status;

    public DataProduct() {}

    // TODO: add methods publish(), requestReview(), anonymize()
}
