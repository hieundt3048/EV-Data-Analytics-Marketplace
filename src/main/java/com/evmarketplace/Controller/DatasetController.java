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
    public DatasetController(DatasetService service){ this.service = service; }

    @GetMapping("/search")
    public List<Dataset> search(@RequestParam(value="q", required=false) String q,
                                @RequestParam(value="categoryId", required=false) Long categoryId,
                                @RequestParam(value="minPrice", required=false) Double minPrice,
                                @RequestParam(value="maxPrice", required=false) Double maxPrice) {
        Specification<Dataset> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if(q != null && !q.isEmpty()) {
                String like = "%" + q.toLowerCase() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            if(categoryId != null) preds.add(cb.equal(root.get("category").get("id"), categoryId));
            if(minPrice != null) preds.add(cb.ge(root.get("price"), minPrice));
            if(maxPrice != null) preds.add(cb.le(root.get("price"), maxPrice));
            return cb.and(preds.toArray(new Predicate[0]));
        };
        return service.search(spec);
    }

    @GetMapping
    public List<Dataset> all(){ return service.findAll(); }
}
