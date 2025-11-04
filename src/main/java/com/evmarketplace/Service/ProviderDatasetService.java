package com.evmarketplace.Service;

import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public ProviderDataset updateS3Info(Long id, String s3Url, long sizeBytes) {
        ProviderDataset dataset = findById(id);
        if (dataset == null) return null;
        dataset.setS3Url(s3Url);
        dataset.setSizeBytes(sizeBytes);
        dataset.setStatus("UPLOADED");
        return datasetRepository.save(dataset);
    }
}
