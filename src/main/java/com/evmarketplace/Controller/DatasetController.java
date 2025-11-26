package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Service.DatasetService;
import com.evmarketplace.Service.ProviderDatasetService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/datasets")
@CrossOrigin(origins = "http://localhost:5173")
public class DatasetController {
    private final DatasetService service;
    private final ProviderDatasetService providerDatasetService;

    public DatasetController(DatasetService service, ProviderDatasetService providerDatasetService) {
        this.service = service;
        this.providerDatasetService = providerDatasetService;
    }

    // THÊM ENDPOINT MỚI - Lấy datasets đã approved
    @GetMapping("/approved")
    public ResponseEntity<List<Dataset>> getApprovedDatasets() {
        try {
            List<Dataset> approvedDatasets = service.findAll().stream()
                .filter(dataset -> {
                    // Lọc datasets đã approved
                    // Có thể thêm logic phức tạp hơn như kiểm tra status, v.v.
                    return dataset.getIsSubscription() != null; // Tạm thời lấy tất cả
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(approvedDatasets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // THÊM ENDPOINT MỚI - Download dataset
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDataset(@PathVariable Long id) {
        System.out.println("=== Download Dataset Called ===");
        System.out.println("Dataset ID: " + id);
        
        try {
            // Try ProviderDataset first (this is what orders reference)
            ProviderDataset providerDataset = providerDatasetService.findById(id);
            
            if (providerDataset != null) {
                System.out.println("Found provider dataset: " + providerDataset.getName());
                
                // Generate download content
                String downloadContent = String.format(
                    "Dataset: %s (ID: %d)\n" +
                    "Description: %s\n" +
                    "Category: %s\n" +
                    "Region: %s\n" +
                    "Format: %s\n" +
                    "Size: %d bytes\n" +
                    "Price: $%.2f\n\n" +
                    "This is a sample dataset file. In production, this would contain the actual dataset content.\n",
                    providerDataset.getName(),
                    providerDataset.getId(),
                    providerDataset.getDescription(),
                    providerDataset.getCategory(),
                    providerDataset.getRegion(),
                    providerDataset.getDataFormat(),
                    providerDataset.getSizeBytes(),
                    providerDataset.getPrice()
                );
                
                String filename = providerDataset.getName().replaceAll("[^a-zA-Z0-9\\-_]", "_") + ".txt";
                System.out.println("Returning download response for: " + providerDataset.getName());
                
                return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", "text/plain")
                    .body(downloadContent);
            }
            
            // Fallback to Dataset table
            Optional<Dataset> datasetOpt = service.findById(id);
            if (datasetOpt.isPresent()) {
                Dataset dataset = datasetOpt.get();
                System.out.println("Found dataset: " + dataset.getTitle());
                
                String downloadContent = String.format(
                    "Dataset: %s (ID: %d)\n\n" +
                    "This is a sample dataset file. In production, this would contain the actual dataset content.\n",
                    dataset.getTitle(), dataset.getId()
                );
                
                return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + dataset.getTitle().replaceAll("[^a-zA-Z0-9\\-_]", "_") + ".txt\"")
                    .header("Content-Type", "text/plain")
                    .body(downloadContent);
            }
            
            // Not found in either table
            System.out.println("Dataset not found in either table: " + id);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Dataset not found");
            error.put("message", "Dataset ID " + id + " does not exist in the system.");
            error.put("datasetId", String.valueOf(id));
            return ResponseEntity.status(404).body(error);
            
        } catch (Exception e) {
            System.err.println("Download error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Download failed: " + e.getMessage());
        }
    }

    // CÁC ENDPOINTS HIỆN CÓ - GIỮ NGUYÊN
    @GetMapping("/search")
    public ResponseEntity<List<Dataset>> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "dataType", required = false) String dataType,
            @RequestParam(value = "vehicleType", required = false) String vehicleType,
            @RequestParam(value = "timeRange", required = false) String timeRange,
            @RequestParam(value = "batteryType", required = false) String batteryType,
            @RequestParam(value = "dataFormat", required = false) String dataFormat,
            @RequestParam(value = "pricingType", required = false) String pricingType) {

        try {
            Specification<Dataset> spec = (root, criteriaQuery, criteriaBuilder) -> {
                List<Predicate> predicates = new ArrayList<>();

                // Tìm kiếm theo từ khóa (title hoặc description)
                if (query != null && !query.trim().isEmpty()) {
                    String searchTerm = "%" + query.toLowerCase() + "%";
                    Predicate titlePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), searchTerm);
                    Predicate descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), searchTerm);
                    predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
                }

                // Lọc theo category
                if (categoryId != null) {
                    predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
                }

                // Lọc theo khoảng giá
                if (minPrice != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
                }

                // Lọc theo khu vực
                if (region != null && !region.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("region"), region));
                }

                // Lọc theo loại dữ liệu
                if (dataType != null && !dataType.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("dataType"), dataType));
                }

                // Lọc theo loại xe
                if (vehicleType != null && !vehicleType.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("vehicleType"), vehicleType));
                }

                // Lọc theo khoảng thời gian thu thập
                if (timeRange != null && !timeRange.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("collectionDate"), timeRange));
                }

                // Lọc theo loại pin
                if (batteryType != null && !batteryType.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("tags"), batteryType));
                }

                // Lọc theo định dạng dữ liệu
                if (dataFormat != null && !dataFormat.trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("dataType"), dataFormat));
                }

                // Lọc theo mô hình định giá
                if (pricingType != null && !pricingType.trim().isEmpty()) {
                    if ("subscription".equals(pricingType)) {
                        predicates.add(criteriaBuilder.isTrue(root.get("isSubscription")));
                    } else if ("per_request".equals(pricingType)) {
                        predicates.add(criteriaBuilder.isFalse(root.get("isSubscription")));
                    }
                }

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            };

            List<Dataset> results = service.search(spec);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/featured")
    public List<Dataset> getFeaturedDatasets() {
        // Return first 10 datasets as featured, or implement logic to get featured ones
        List<Dataset> all = service.findAll();
        return all.subList(0, Math.min(10, all.size()));
    }

    @GetMapping
    public List<Dataset> getAllDatasets() {
        return service.findAll();
    }
}