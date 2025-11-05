package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Category;
import com.evmarketplace.Repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository repo;
    
    public CategoryService(CategoryRepository repo) { 
        this.repo = repo; 
    }
    
    public List<Category> findAll() { 
        return repo.findAll(); 
    }
    
    // Thêm method mới
    public Optional<Category> findById(Long id) {
        return repo.findById(id);
    }
}