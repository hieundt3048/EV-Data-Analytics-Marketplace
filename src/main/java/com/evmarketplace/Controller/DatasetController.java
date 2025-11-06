package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Service.DatasetService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {
    private final DatasetService service;
    
    public DatasetController(DatasetService service) { 
        this.service = service; 
    }

    @GetMapping("/search")
    public List<Dataset> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "dataType", required = false) String dataType) {
        
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
            
            // Lọc theo khu vực (nếu có field region trong Dataset)
            if (region != null && !region.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("region"), region));
            }
            
            // Lọc theo loại dữ liệu (nếu có field dataType trong Dataset)
            if (dataType != null && !dataType.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("dataType"), dataType));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return service.search(spec);
    }

    @GetMapping
    public List<Dataset> getAllDatasets() {
        return service.findAll();
    }
}