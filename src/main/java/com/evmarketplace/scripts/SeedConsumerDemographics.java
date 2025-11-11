package com.evmarketplace.scripts;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Repository.ConsumerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Script để seed demographics data cho consumers
 * Chạy 1 lần rồi comment lại @Component
 */
// @Component // UNCOMMENT để chạy khi start app, sau đó COMMENT lại
public class SeedConsumerDemographics implements CommandLineRunner {

    private final ConsumerRepository consumerRepository;

    public SeedConsumerDemographics(ConsumerRepository consumerRepository) {
        this.consumerRepository = consumerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("===== SEEDING CONSUMER DEMOGRAPHICS =====");
        
        // Tìm Demo User
        Consumer demoUser = consumerRepository.findByEmail("demo@example.com")
                .orElse(null);
        
        if (demoUser == null) {
            // Thử tìm bằng tên
            demoUser = consumerRepository.findAll().stream()
                    .filter(c -> c.getName() != null && c.getName().toLowerCase().contains("demo"))
                    .findFirst()
                    .orElse(null);
        }
        
        if (demoUser != null) {
            System.out.println("Found Demo User: " + demoUser.getName() + " (ID: " + demoUser.getId() + ")");
            
            // Update demographics
            demoUser.setIndustry("OEM (Original Equipment Manufacturer)");
            demoUser.setRegion("Asia Pacific");
            demoUser.setCompanySize("Large (501+ employees)");
            demoUser.setUseCaseType("Research & Development");
            
            if (demoUser.getOrganization() == null || demoUser.getOrganization().trim().isEmpty()) {
                demoUser.setOrganization("Tesla Motors");
            }
            
            consumerRepository.save(demoUser);
            
            System.out.println("Updated Demo User demographics:");
            System.out.println("   - Industry: " + demoUser.getIndustry());
            System.out.println("   - Region: " + demoUser.getRegion());
            System.out.println("   - Company Size: " + demoUser.getCompanySize());
            System.out.println("   - Use Case: " + demoUser.getUseCaseType());
            System.out.println("   - Organization: " + demoUser.getOrganization());
        } else {
            System.out.println("Demo User not found!");
        }
        
        System.out.println("===== SEEDING COMPLETE =====");
    }
}
