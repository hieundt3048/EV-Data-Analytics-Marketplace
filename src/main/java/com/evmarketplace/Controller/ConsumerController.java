package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Service.ConsumerService;
import com.evmarketplace.Service.ProviderDatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/consumers")
public class ConsumerController {

    @Autowired
    private ConsumerService consumerService;
    
    @Autowired
    private ProviderDatasetService providerDatasetService;

    // ✅ Lấy danh sách tất cả người dùng dữ liệu
    @GetMapping
    public ResponseEntity<List<Consumer>> getAllConsumers() {
        return ResponseEntity.ok(consumerService.getAllConsumers());
    }

    // ✅ Lấy thông tin một người dùng cụ thể theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Consumer> getConsumerById(@PathVariable Long id) {
        Optional<Consumer> consumer = consumerService.getConsumerById(id);
        return consumer.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Thêm mới người dùng
    @PostMapping
    public ResponseEntity<Consumer> createConsumer(@RequestBody Consumer consumer) {
        Consumer saved = consumerService.createConsumer(consumer);
        return ResponseEntity.ok(saved);
    }

    // ✅ Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    public ResponseEntity<Consumer> updateConsumer(@PathVariable Long id, @RequestBody Consumer consumer) {
        Consumer updated = consumerService.updateConsumer(id, consumer);
        return ResponseEntity.ok(updated);
    }

    // ✅ Xóa người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsumer(@PathVariable Long id) {
        consumerService.deleteConsumer(id);
        return ResponseEntity.noContent().build();
    }
    
    // ✅ Lấy danh sách datasets đã được approve cho Consumer
    @GetMapping("/datasets/approved")
    public ResponseEntity<List<ProviderDataset>> getApprovedDatasets() {
        List<ProviderDataset> approvedDatasets = providerDatasetService.findByStatus("APPROVED");
        return ResponseEntity.ok(approvedDatasets);
    }
}
