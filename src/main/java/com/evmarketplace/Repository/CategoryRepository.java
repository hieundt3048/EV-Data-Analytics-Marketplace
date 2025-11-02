package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
