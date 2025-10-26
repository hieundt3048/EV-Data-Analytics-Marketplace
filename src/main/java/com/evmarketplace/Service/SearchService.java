// Mục đích: Giao diện dịch vụ tìm kiếm (SearchService).
// Đáp ứng: Cung cấp API tìm kiếm DataProduct theo tiêu chí lọc cho marketplace.
package com.evmarketplace.Service;

import com.evmarketplace.data.DataProduct;
import java.util.List;

public interface SearchService {
    List<DataProduct> search(Object filterCriteria);
}
