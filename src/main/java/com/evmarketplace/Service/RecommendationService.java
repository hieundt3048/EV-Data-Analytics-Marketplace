package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.dto.RecommendationDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered Recommendation Engine
 * Implements multiple recommendation strategies:
 * 1. Collaborative Filtering - Based on similar users' purchases
 * 2. Content-Based - Based on dataset attributes
 * 3. Trending Analysis - Based on recent popularity
 * 4. Hybrid - Combination of above methods
 */
@Service
public class RecommendationService {
    
    private final OrderRepository orderRepository;
    private final ProviderDatasetRepository datasetRepository;
    
    // Weights for hybrid recommendations
    private static final double COLLABORATIVE_WEIGHT = 0.4;
    private static final double CONTENT_BASED_WEIGHT = 0.3;
    private static final double TRENDING_WEIGHT = 0.3;
    
    public RecommendationService(OrderRepository orderRepository,
                                ProviderDatasetRepository datasetRepository) {
        this.orderRepository = orderRepository;
        this.datasetRepository = datasetRepository;
    }
    
    /**
     * Get personalized recommendations for a consumer
     * Uses hybrid approach combining multiple algorithms
     */
    @Transactional(readOnly = true)
    public List<RecommendationDTO> getPersonalizedRecommendations(Long consumerId, int limit) {
        // Get consumer's purchase history
        List<Order> userOrders = orderRepository.findByBuyerId(consumerId);
        Set<Long> purchasedDatasetIds = userOrders.stream()
            .map(Order::getDatasetId)
            .collect(Collectors.toSet());
        
        // Get all available datasets (exclude already purchased)
        List<ProviderDataset> allDatasets = datasetRepository.findAll().stream()
            .filter(ds -> !purchasedDatasetIds.contains(ds.getId()))
            .collect(Collectors.toList());
        
        if (allDatasets.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Calculate scores using different algorithms
        Map<Long, Double> collaborativeScores = calculateCollaborativeScores(consumerId, allDatasets);
        Map<Long, Double> contentBasedScores = calculateContentBasedScores(consumerId, allDatasets, userOrders);
        Map<Long, Double> trendingScores = calculateTrendingScores(allDatasets);
        
        // Combine scores with weights
        Map<Long, RecommendationDTO> recommendations = new HashMap<>();
        for (ProviderDataset dataset : allDatasets) {
            Long datasetId = dataset.getId();
            
            double collaborativeScore = collaborativeScores.getOrDefault(datasetId, 0.0);
            double contentScore = contentBasedScores.getOrDefault(datasetId, 0.0);
            double trendingScore = trendingScores.getOrDefault(datasetId, 0.0);
            
            // Hybrid score
            double finalScore = (collaborativeScore * COLLABORATIVE_WEIGHT) +
                               (contentScore * CONTENT_BASED_WEIGHT) +
                               (trendingScore * TRENDING_WEIGHT);
            
            RecommendationDTO dto = new RecommendationDTO();
            dto.setDatasetId(datasetId);
            dto.setDatasetName(dataset.getName());
            dto.setDescription(dataset.getDescription());
            dto.setCategory(dataset.getCategory());
            dto.setPrice(dataset.getPrice());
            dto.setRecommendationScore(Math.round(finalScore * 100.0) / 100.0);
            dto.setRecommendationType("HYBRID");
            dto.setReason(generateRecommendationReason(collaborativeScore, contentScore, trendingScore));
            
            // Add metadata
            int purchaseCount = countDatasetPurchases(datasetId);
            dto.setPurchaseCount(purchaseCount);
            
            recommendations.put(datasetId, dto);
        }
        
        // Sort by score and return top N
        return recommendations.values().stream()
            .sorted((a, b) -> Double.compare(b.getRecommendationScore(), a.getRecommendationScore()))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Collaborative Filtering: "Users who bought this also bought..."
     * Finds similar users based on purchase history
     */
    private Map<Long, Double> calculateCollaborativeScores(Long consumerId, List<ProviderDataset> datasets) {
        Map<Long, Double> scores = new HashMap<>();
        
        // Get user's purchases
        List<Order> userOrders = orderRepository.findByBuyerId(consumerId);
        Set<Long> userDatasets = userOrders.stream()
            .map(Order::getDatasetId)
            .collect(Collectors.toSet());
        
        if (userDatasets.isEmpty()) {
            return scores; // No history, return empty
        }
        
        // Find similar users (users who bought the same datasets)
        List<Order> allOrders = orderRepository.findAll();
        Map<Long, Set<Long>> userToPurchases = new HashMap<>();
        
        for (Order order : allOrders) {
            userToPurchases.computeIfAbsent(order.getBuyerId(), k -> new HashSet<>())
                .add(order.getDatasetId());
        }
        
        // Calculate similarity with other users (Jaccard similarity)
        Map<Long, Double> userSimilarity = new HashMap<>();
        for (Map.Entry<Long, Set<Long>> entry : userToPurchases.entrySet()) {
            Long otherUserId = entry.getKey();
            if (otherUserId.equals(consumerId)) continue;
            
            Set<Long> otherDatasets = entry.getValue();
            double similarity = jaccardSimilarity(userDatasets, otherDatasets);
            if (similarity > 0.1) { // Threshold
                userSimilarity.put(otherUserId, similarity);
            }
        }
        
        // Recommend datasets that similar users bought
        for (ProviderDataset dataset : datasets) {
            double score = 0.0;
            for (Map.Entry<Long, Double> entry : userSimilarity.entrySet()) {
                Long similarUserId = entry.getKey();
                Double similarity = entry.getValue();
                
                if (userToPurchases.get(similarUserId).contains(dataset.getId())) {
                    score += similarity;
                }
            }
            scores.put(dataset.getId(), score);
        }
        
        // Normalize scores
        return normalizeScores(scores);
    }
    
    /**
     * Content-Based Filtering: Based on dataset attributes
     * Recommends datasets similar to what user has purchased
     */
    private Map<Long, Double> calculateContentBasedScores(Long consumerId, 
                                                          List<ProviderDataset> datasets,
                                                          List<Order> userOrders) {
        Map<Long, Double> scores = new HashMap<>();
        
        if (userOrders.isEmpty()) {
            return scores;
        }
        
        // Get categories of purchased datasets
        Set<Long> purchasedIds = userOrders.stream()
            .map(Order::getDatasetId)
            .collect(Collectors.toSet());
        
        List<ProviderDataset> purchasedDatasets = datasetRepository.findAllById(purchasedIds);
        Map<String, Integer> categoryPreference = new HashMap<>();
        
        for (ProviderDataset dataset : purchasedDatasets) {
            String category = dataset.getCategory();
            categoryPreference.put(category, categoryPreference.getOrDefault(category, 0) + 1);
        }
        
        // Score datasets based on category similarity
        for (ProviderDataset dataset : datasets) {
            String category = dataset.getCategory();
            double score = categoryPreference.getOrDefault(category, 0) / (double) purchasedDatasets.size();
            scores.put(dataset.getId(), score);
        }
        
        return normalizeScores(scores);
    }
    
    /**
     * Trending Analysis: Based on recent popularity
     * Recommends datasets that are currently popular
     */
    private Map<Long, Double> calculateTrendingScores(List<ProviderDataset> datasets) {
        Map<Long, Double> scores = new HashMap<>();
        
        // Get orders from last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Order> recentOrders = orderRepository.findAll().stream()
            .filter(o -> o.getOrderDate().isAfter(thirtyDaysAgo))
            .collect(Collectors.toList());
        
        // Count purchases per dataset
        Map<Long, Long> purchaseCounts = recentOrders.stream()
            .collect(Collectors.groupingBy(Order::getDatasetId, Collectors.counting()));
        
        // Calculate scores based on purchase count
        for (ProviderDataset dataset : datasets) {
            Long count = purchaseCounts.getOrDefault(dataset.getId(), 0L);
            scores.put(dataset.getId(), count.doubleValue());
        }
        
        return normalizeScores(scores);
    }
    
    /**
     * Get trending datasets (public endpoint)
     */
    @Transactional(readOnly = true)
    public List<RecommendationDTO> getTrendingDatasets(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Order> recentOrders = orderRepository.findAll().stream()
            .filter(o -> o.getOrderDate().isAfter(thirtyDaysAgo))
            .collect(Collectors.toList());
        
        // Count purchases
        Map<Long, Long> purchaseCounts = recentOrders.stream()
            .collect(Collectors.groupingBy(Order::getDatasetId, Collectors.counting()));
        
        // Sort by count and get top datasets
        List<Long> topDatasetIds = purchaseCounts.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .limit(limit)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        
        List<ProviderDataset> datasets = datasetRepository.findAllById(topDatasetIds);
        
        return datasets.stream()
            .map(ds -> {
                RecommendationDTO dto = new RecommendationDTO();
                dto.setDatasetId(ds.getId());
                dto.setDatasetName(ds.getName());
                dto.setDescription(ds.getDescription());
                dto.setCategory(ds.getCategory());
                dto.setPrice(ds.getPrice());
                dto.setRecommendationType("TRENDING");
                dto.setReason("Popular in last 30 days");
                dto.setPurchaseCount(purchaseCounts.get(ds.getId()).intValue());
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get similar datasets based on a specific dataset
     */
    @Transactional(readOnly = true)
    public List<RecommendationDTO> getSimilarDatasets(Long datasetId, int limit) {
        Optional<ProviderDataset> targetOpt = datasetRepository.findById(datasetId);
        if (!targetOpt.isPresent()) {
            return new ArrayList<>();
        }
        
        ProviderDataset target = targetOpt.get();
        List<ProviderDataset> allDatasets = datasetRepository.findAll().stream()
            .filter(ds -> !ds.getId().equals(datasetId))
            .collect(Collectors.toList());
        
        // Find datasets in same category
        List<ProviderDataset> similar = allDatasets.stream()
            .filter(ds -> ds.getCategory().equals(target.getCategory()))
            .limit(limit)
            .collect(Collectors.toList());
        
        return similar.stream()
            .map(ds -> {
                RecommendationDTO dto = new RecommendationDTO();
                dto.setDatasetId(ds.getId());
                dto.setDatasetName(ds.getName());
                dto.setDescription(ds.getDescription());
                dto.setCategory(ds.getCategory());
                dto.setPrice(ds.getPrice());
                dto.setRecommendationType("CONTENT_BASED");
                dto.setReason("Similar to: " + target.getName());
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    // Helper methods
    
    /**
     * Calculate Jaccard similarity between two sets
     */
    private double jaccardSimilarity(Set<Long> set1, Set<Long> set2) {
        if (set1.isEmpty() && set2.isEmpty()) return 0.0;
        
        Set<Long> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<Long> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return intersection.size() / (double) union.size();
    }
    
    /**
     * Normalize scores to 0-1 range
     */
    private Map<Long, Double> normalizeScores(Map<Long, Double> scores) {
        if (scores.isEmpty()) return scores;
        
        double maxScore = scores.values().stream()
            .max(Double::compare)
            .orElse(1.0);
        
        if (maxScore == 0.0) return scores;
        
        Map<Long, Double> normalized = new HashMap<>();
        for (Map.Entry<Long, Double> entry : scores.entrySet()) {
            normalized.put(entry.getKey(), entry.getValue() / maxScore);
        }
        return normalized;
    }
    
    /**
     * Generate human-readable recommendation reason
     */
    private String generateRecommendationReason(double collaborative, double content, double trending) {
        if (collaborative > content && collaborative > trending) {
            return "Similar users also purchased this";
        } else if (content > trending) {
            return "Based on your purchase history";
        } else {
            return "Trending in marketplace";
        }
    }
    
    /**
     * Count total purchases for a dataset
     */
    private int countDatasetPurchases(Long datasetId) {
        return (int) orderRepository.findAll().stream()
            .filter(o -> o.getDatasetId().equals(datasetId))
            .count();
    }
}
