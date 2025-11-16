package com.evmarketplace.Controller;

// Mục đích: Controller xử lý các tác vụ dành riêng cho Admin.
// Đáp ứng: Cung cấp các API endpoint để quản lý người dùng, duyệt sản phẩm, xem báo cáo.

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Repository.APIKeyRepository;
import com.evmarketplace.Repository.TransactionRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.Service.ProviderDatasetService;
import com.evmarketplace.Service.OrderService;
import com.evmarketplace.data.DataProduct;
import com.evmarketplace.data.ProductStatus;
import com.evmarketplace.marketplace.Purchase;
import com.evmarketplace.Repository.DataProductRepository;
import com.evmarketplace.Repository.PurchaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Comparator;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('Admin')") // Yêu cầu vai trò Admin cho tất cả các endpoint trong controller này
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final DataProductRepository dataProductRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransactionRepository transactionRepository;
    private final APIKeyRepository apiKeyRepository;
    private final ProviderDatasetService providerDatasetService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public AdminController(
            UserService userService,
            UserRepository userRepository,
            DataProductRepository dataProductRepository,
            PurchaseRepository purchaseRepository,
            TransactionRepository transactionRepository,
            APIKeyRepository apiKeyRepository,
            ProviderDatasetService providerDatasetService,
            OrderService orderService,
            OrderRepository orderRepository
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.dataProductRepository = dataProductRepository;
        this.purchaseRepository = purchaseRepository;
        this.transactionRepository = transactionRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.providerDatasetService = providerDatasetService;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    /**
     * Lấy danh sách tất cả người dùng trong hệ thống.
     * Chỉ Admin mới có quyền truy cập.
     * @return Danh sách các đối tượng User.
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody AdminUserUpdateRequest body) {
        try {
            User updated = userService.updateUser(userId, body.getName(), body.getOrganization(), body.getProviderApproved(), body.getRoles());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/providers")
    public ResponseEntity<List<User>> getProviders() {
        return ResponseEntity.ok(userService.getUsersByRole("Provider"));
    }

    @GetMapping("/users/consumers")
    public ResponseEntity<List<User>> getConsumers() {
        return ResponseEntity.ok(userService.getUsersByRole("Consumer"));
    }

    @GetMapping("/users/partners")
    public ResponseEntity<List<User>> getPartners() {
        return ResponseEntity.ok(userService.getUsersByRole("Partner"));
    }

    /**
     * Phê duyệt một tài khoản nhà cung cấp (Provider).
     * @param userId ID của người dùng cần được phê duyệt.
     * @return ResponseEntity chứa thông báo thành công hoặc lỗi.
     */
    @PostMapping("/providers/{userId}/approve")
    public ResponseEntity<?> approveProvider(@PathVariable Long userId) {
        try {
            User updatedUser = userService.approveProvider(userId);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/datasets/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingDatasets() {
        List<Map<String, Object>> payload = dataProductRepository.findByStatus(ProductStatus.PENDING_REVIEW).stream()
                .map(p -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", p.getId());
                    dto.put("title", p.getTitle());
                    dto.put("status", p.getStatus());
                    dto.put("providerId", p.getProviderId());
                    if (p.getProvider() != null) {
                        dto.put("providerName", p.getProvider().getProviderName());
                        dto.put("providerEmail", p.getProvider().getContactEmail());
                        if (p.getProvider().getUser() != null) {
                            dto.put("accountName", p.getProvider().getUser().getName());
                        }
                    }
                    dto.put("submittedAt", p.getStartTime());
                    dto.put("region", p.getRegion());
                    dto.put("sizeBytes", p.getSizeBytes());
                    return dto;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(payload);
    }

    @PutMapping("/datasets/{id}/approve")
    public ResponseEntity<?> approveDataset(@PathVariable UUID id) {
        return dataProductRepository.findById(id).map(product -> {
            product.setStatus(ProductStatus.PUBLISHED);
            dataProductRepository.save(product);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/datasets/{id}/reject")
    public ResponseEntity<?> rejectDataset(@PathVariable UUID id) {
        return dataProductRepository.findById(id).map(product -> {
            product.setStatus(ProductStatus.ARCHIVED);
            dataProductRepository.save(product);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/payments/transactions")
    public ResponseEntity<?> listTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    /**
     * Lấy danh sách tất cả orders (giao dịch mua dataset)
     * Hiển thị trong "Recent Transactions" của Admin
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        
        // Map to DTO với đầy đủ thông tin
        List<Map<String, Object>> ordersDTO = orders.stream()
            .sorted(Comparator.comparing(Order::getOrderDate).reversed())
            .map(order -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", order.getId());
                dto.put("datasetId", order.getDatasetId());
                dto.put("buyerId", order.getBuyerId());
                dto.put("providerId", order.getProviderId());
                dto.put("amount", order.getAmount());
                dto.put("platformRevenue", order.getPlatformRevenue());
                dto.put("providerRevenue", order.getProviderRevenue());
                dto.put("status", order.getStatus());
                dto.put("orderDate", order.getOrderDate());
                dto.put("payoutDate", order.getPayoutDate());
                return dto;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(ordersDTO);
    }

    @GetMapping("/payments/revenue-share")
    public ResponseEntity<?> getRevenueShareByProvider() {
    Map<UUID, Purchase> purchasesById = purchaseRepository.findAll().stream()
        .collect(Collectors.toMap(Purchase::getId, p -> p));
    Map<UUID, DataProduct> productsById = dataProductRepository.findAll().stream()
        .collect(Collectors.toMap(DataProduct::getId, p -> p));

    Map<UUID, Double> share = transactionRepository.findAll().stream()
        .filter(t -> t.getProviderShare() != null && t.getPurchaseId() != null)
        .collect(Collectors.groupingBy(t -> {
            Purchase purchase = purchasesById.get(t.getPurchaseId());
            if (purchase == null) return null;
            DataProduct product = productsById.get(purchase.getProductId());
            return product != null ? product.getProviderId() : null;
        }, Collectors.summingDouble(t -> t.getProviderShare().doubleValue())));

    share.remove(null);
    return ResponseEntity.ok(share);
    }

    @GetMapping("/security/apikeys")
    public ResponseEntity<?> listApiKeys() {
        List<APIKey> keys = apiKeyRepository.findAll();
        
        // Enrich với thông tin Consumer
        List<Map<String, Object>> enrichedKeys = keys.stream().map(key -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", key.getId());
            data.put("key", maskApiKey(key.getKey())); // Mask key để bảo mật
            data.put("consumerId", key.getConsumerId());
            
            // Lấy thông tin Consumer
            // Note: consumerId trong APIKey là UUID, cần mapping với User.id (Long)
            // Tạm thời skip consumer info vì mismatch type
            try {
                // For now, set consumer to null - this needs proper database schema fix
                data.put("consumer", Map.of(
                    "id", key.getConsumerId().toString(),
                    "note", "Consumer info unavailable - ID type mismatch"
                ));
            } catch (Exception e) {
                data.put("consumer", null);
            }
            
            data.put("scopes", key.getScopes());
            data.put("rateLimit", key.getRateLimit());
            data.put("expiresAt", key.getExpiryDate());
            data.put("createdAt", key.getCreatedAt());
            
            // Tính status dựa trên expiresAt
            String status = "active";
            if (key.getExpiryDate() != null && key.getExpiryDate().before(new java.util.Date())) {
                status = "expired";
            }
            data.put("status", status);
            
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "keys", enrichedKeys,
            "total", enrichedKeys.size()
        ));
    }
    
    /**
     * Mask API key để bảo mật (chỉ hiển thị prefix và suffix)
     */
    private String maskApiKey(String key) {
        if (key == null || key.length() < 16) return key;
        String prefix = key.substring(0, Math.min(12, key.length()));
        String suffix = key.substring(Math.max(0, key.length() - 4));
        return prefix + "****" + suffix;
    }
    
    /**
     * Tạo API key mới cho consumer (Admin only)
     * POST /api/admin/security/apikeys
     */
    @PostMapping("/security/apikeys")
    public ResponseEntity<?> createApiKey(@RequestBody Map<String, Object> payload) {
        try {
            // Validate required fields
            if (!payload.containsKey("userId")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "userId is required"
                ));
            }
            
            Long userId = Long.parseLong(payload.get("userId").toString());
            
            // Verify user exists and is a Consumer
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }
            
            // Generate unique API key
            String apiKey = generateUniqueApiKey();
            
            // Get scopes/permissions
            @SuppressWarnings("unchecked")
            List<String> scopes = payload.containsKey("scopes") 
                ? (List<String>) payload.get("scopes") 
                : List.of("read:datasets");
            
            // Get rate limit (default 100/hr)
            int rateLimit = payload.containsKey("rateLimit") 
                ? Integer.parseInt(payload.get("rateLimit").toString()) 
                : 100;
            
            // Get expiry days (default 365)
            int expiresInDays = payload.containsKey("expiresInDays") 
                ? Integer.parseInt(payload.get("expiresInDays").toString()) 
                : 365;
            
            // Create APIKey entity
            // Note: consumerId in APIKey is UUID, but User.id is Long
            // We'll use a deterministic UUID based on userId for now
            UUID consumerId = UUID.nameUUIDFromBytes(("consumer-" + userId).getBytes());
            
            APIKey newKey = new APIKey(consumerId, apiKey);
            newKey.setScopes(scopes);
            newKey.setRateLimit(rateLimit);
            
            // Set expiry date
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.add(java.util.Calendar.DAY_OF_YEAR, expiresInDays);
            newKey.setExpiresAt(cal.getTime());
            
            // Save to database
            APIKey savedKey = apiKeyRepository.save(newKey);
            
            // Return response with full key (only shown once!)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "API key created successfully");
            response.put("key", savedKey.getKey()); // Full key - only shown once!
            response.put("id", savedKey.getId());
            response.put("consumerId", savedKey.getConsumerId());
            response.put("scopes", savedKey.getScopes());
            response.put("rateLimit", savedKey.getRateLimit());
            response.put("expiresAt", savedKey.getExpiresAt());
            response.put("createdAt", savedKey.getCreatedAt());
            
            return ResponseEntity.status(201).body(response);
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Invalid number format in request"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to create API key: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Generate a unique API key string
     */
    private String generateUniqueApiKey() {
        // Format: vmkt_<random_uuid_without_dashes>
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return "vmkt_" + uuid;
    }

    @PutMapping("/security/apikeys/{id}/revoke")
    public ResponseEntity<?> revokeApiKey(@PathVariable UUID id) {
        return apiKeyRepository.findById(id).map(key -> {
            // Set expiresAt to past date to revoke
            key.setExpiryDate(new java.util.Date(0)); // Epoch time = revoked
            APIKey updated = apiKeyRepository.save(key);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API key revoked successfully",
                "key", updated
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of(
            "success", false,
            "error", "API key not found"
        )));
    }
    
    @DeleteMapping("/security/apikeys/{id}")
    public ResponseEntity<?> deleteApiKey(@PathVariable UUID id) {
        return apiKeyRepository.findById(id).map(key -> {
            // Permanently delete from database
            apiKeyRepository.delete(key);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API key permanently deleted"
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of(
            "success", false,
            "error", "API key not found"
        )));
    }
    
    /**
     * Lấy usage statistics chi tiết cho một API key
     */
    @GetMapping("/security/apikeys/{id}/usage")
    public ResponseEntity<?> getApiKeyUsage(@PathVariable UUID id) {
        return apiKeyRepository.findById(id).map(key -> {
            // TODO: Tích hợp với ApiAccessService để lấy thống kê thực
            Map<String, Object> usage = new HashMap<>();
            usage.put("keyId", key.getId());
            usage.put("totalRequests", 0); // Placeholder
            usage.put("successfulRequests", 0);
            usage.put("failedRequests", 0);
            usage.put("lastUsed", null);
            usage.put("bandwidthUsed", "0 MB");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "usage", usage
            ));
        }).orElse(ResponseEntity.status(404).body(Map.of(
            "success", false,
            "error", "API key not found"
        )));
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<?> getAnalyticsOverview() {
        long totalUsers = userService.getAllUsers().size();
        long providers = userService.getUsersByRole("Provider").size();
        long consumers = userService.getUsersByRole("Consumer").size();
        List<DataProduct> products = dataProductRepository.findAll();
        long pending = products.stream().filter(p -> p.getStatus() == ProductStatus.PENDING_REVIEW).count();
        long published = products.stream().filter(p -> p.getStatus() == ProductStatus.PUBLISHED).count();
        
        // Thêm thống kê Provider Datasets
        List<ProviderDataset> providerDatasets = providerDatasetService.findAll();
        long pendingProviderDatasets = providerDatasets.stream()
            .filter(d -> "PENDING_REVIEW".equals(d.getStatus()))
            .count();
        long approvedProviderDatasets = providerDatasets.stream()
            .filter(d -> "APPROVED".equals(d.getStatus()))
            .count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("providers", providers);
        response.put("consumers", consumers);
        response.put("pendingProducts", pending);
        response.put("publishedProducts", published);
        response.put("pendingProviderDatasets", pendingProviderDatasets);
        response.put("approvedProviderDatasets", approvedProviderDatasets);
        return ResponseEntity.ok(response);
    }

    // ==================== PROVIDER DATASETS MODERATION ====================
    
    /**
     * Lấy danh sách datasets đang chờ duyệt từ providers
     */
    @GetMapping("/provider-datasets/pending")
    public ResponseEntity<List<ProviderDataset>> getPendingProviderDatasets() {
        List<ProviderDataset> pending = providerDatasetService.findByStatus("PENDING_REVIEW");
        return ResponseEntity.ok(pending);
    }

    /**
     * Lấy tất cả provider datasets (bao gồm cả đã duyệt, chờ duyệt, bị từ chối)
     */
    @GetMapping("/provider-datasets")
    public ResponseEntity<List<ProviderDataset>> getAllProviderDatasets() {
        return ResponseEntity.ok(providerDatasetService.findAll());
    }

    /**
     * Duyệt dataset của provider
     */
    @PutMapping("/provider-datasets/{id}/approve")
    public ResponseEntity<?> approveProviderDataset(@PathVariable Long id) {
        ProviderDataset approved = providerDatasetService.approveDataset(id);
        if (approved == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(approved);
    }

    /**
     * Từ chối dataset của provider
     */
    @PutMapping("/provider-datasets/{id}/reject")
    public ResponseEntity<?> rejectProviderDataset(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Not specified";
        ProviderDataset rejected = providerDatasetService.rejectDataset(id, reason);
        if (rejected == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rejected);
    }

    public static class AdminUserUpdateRequest {
        private String name;
        private String organization;
        private Boolean providerApproved;
        private List<String> roles;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getOrganization() {
            return organization;
        }

        public void setOrganization(String organization) {
            this.organization = organization;
        }

        public Boolean getProviderApproved() {
            return providerApproved;
        }

        public void setProviderApproved(Boolean providerApproved) {
            this.providerApproved = providerApproved;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }

    /**
     * Endpoint để Admin duyệt giao dịch (transaction/order)
     * Khi duyệt sẽ phân chia doanh thu: 30% nền tảng, 70% provider
     * 
     * @param orderId ID của order cần duyệt
     * @return Order đã được duyệt với thông tin revenue split
     */
    @PostMapping("/transactions/{orderId}/approve")
    public ResponseEntity<?> approveTransaction(@PathVariable Long orderId) {
        try {
            Order approvedOrder = orderService.approveTransaction(orderId);
            
            // Tạo response với thông tin chi tiết
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transaction approved successfully");
            response.put("orderId", approvedOrder.getId());
            response.put("totalAmount", approvedOrder.getAmount());
            response.put("platformRevenue", approvedOrder.getPlatformRevenue());
            response.put("providerRevenue", approvedOrder.getProviderRevenue());
            response.put("status", approvedOrder.getStatus());
            response.put("payoutDate", approvedOrder.getPayoutDate());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
