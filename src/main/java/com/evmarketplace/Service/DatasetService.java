package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Repository.DatasetRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DatasetService {
    private final DatasetRepository repo;

    public DatasetService(DatasetRepository repo) { 
        this.repo = repo; 
    }

    public List<Dataset> search(Specification<Dataset> spec) { 
        return repo.findAll(spec); 
    }
    
    public List<Dataset> findAll() { 
        return repo.findAll(); 
    }
    
    public Optional<Dataset> findById(Long id) { 
        return repo.findById(id); 
    }
    
    public Dataset save(Dataset dataset) { 
        return repo.save(dataset); 
    }
}