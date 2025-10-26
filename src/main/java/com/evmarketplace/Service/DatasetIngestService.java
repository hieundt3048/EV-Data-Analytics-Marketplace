// Mục đích: Giao diện dịch vụ ingest dữ liệu (DatasetIngestService).
// Đáp ứng: Nhận DataAsset, xử lý và tạo DataProduct; phục vụ luồng ingest dữ liệu.
package com.evmarketplace.Service;

import com.evmarketplace.data.DataAsset;
import com.evmarketplace.data.DataProduct;

public interface DatasetIngestService {
    DataProduct ingest(DataAsset asset);
}
