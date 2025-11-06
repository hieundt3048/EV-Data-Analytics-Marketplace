package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Category;
import com.evmarketplace.Service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173") // Thêm CORS cho frontend
public class CategoryController {
    private final CategoryService categoryService;
    
    public CategoryController(CategoryService categoryService) { 
        this.categoryService = categoryService; 
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryService.findAll();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Thêm API để lấy category theo ID (tùy chọn)
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}