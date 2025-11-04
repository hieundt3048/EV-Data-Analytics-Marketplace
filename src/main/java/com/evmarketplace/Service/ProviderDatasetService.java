package com.evmarketplace.Service;

import com.evmarketplace.provider.ProviderDataset;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProviderDatasetService {

    @Autowired
    private ProviderDatasetRepository datasetRepository;

    public ProviderDataset save(ProviderDataset dataset) {
        return datasetRepository.save(dataset);
    }

    public List<ProviderDataset> findAll() {
        return datasetRepository.findAll();
    }

    public ProviderDataset findById(Long id) {
        return datasetRepository.findById(id).orElse(null);
    }

    public ProviderDataset findById(UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }
}
