package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Category;
import com.evmarketplace.Service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;
    public CategoryController(CategoryService service){ this.service = service; }

    @GetMapping
    public List<Category> all(){ return service.findAll(); }
}
