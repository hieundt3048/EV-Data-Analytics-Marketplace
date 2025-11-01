package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Repository.ConsumerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConsumerService {

    @Autowired
    private ConsumerRepository consumerRepository;

    public List<Consumer> getAllConsumers() {
        return consumerRepository.findAll();
    }

    public Optional<Consumer> getConsumerById(Long id) {
        return consumerRepository.findById(id);
    }

    public Consumer createConsumer(Consumer consumer) {
        return consumerRepository.save(consumer);
    }

    public Consumer updateConsumer(Long id, Consumer consumerDetails) {
        Consumer consumer = consumerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));
        consumer.setName(consumerDetails.getName());
        consumer.setEmail(consumerDetails.getEmail());
        consumer.setOrganization(consumerDetails.getOrganization());
        return consumerRepository.save(consumer);
    }

    public void deleteConsumer(Long id) {
        consumerRepository.deleteById(id);
    }
}
