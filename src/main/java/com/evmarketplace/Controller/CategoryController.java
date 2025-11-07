package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Category;
import com.evmarketplace.Service.CategoryService;
import com.evmarketplace.dto.CategoryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173") // Thêm CORS cho frontend
public class CategoryController {
    private final CategoryService categoryService;
    
    public CategoryController(CategoryService categoryService) { 
        this.categoryService = categoryService; 
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        try {
            List<Category> categories = categoryService.findAll();
            // Chuyển đổi sang DTO để tránh circular reference và giảm kích thước response
            List<CategoryDTO> categoryDTOs = categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName()))
                .collect(Collectors.toList());
            return ResponseEntity.ok(categoryDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Thêm API để lấy category theo ID (tùy chọn)
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(category -> new CategoryDTO(category.getId(), category.getName()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}