package com.evmarketplace.providers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evmarketplace.Pojo.User;
import com.evmarketplace.Repository.DataProductRepository;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.SecurityUtils;
import com.evmarketplace.data.DataProduct;
import com.evmarketplace.data.ProductStatus;

@RestController("providerDatasetController1")
@RequestMapping("/api/provider")
public class DatasetController {

    private final UserService userService;
    private final DataProductRepository dataProductRepository;

    public DatasetController(UserService userService, DataProductRepository dataProductRepository) {
        this.userService = userService;
        this.dataProductRepository = dataProductRepository;
    }

    // ------------------- API POST: Upload metadata dataset -------------------
    @PostMapping("/datasets/{id}/upload-metadata")
    public ResponseEntity<?> uploadDatasetMetadata(@RequestBody DataProduct body, HttpServletRequest req) {
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (roles == null || !roles.contains("Provider"))
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");

        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized: no email found");

        User u = userService.findByEmail(email).orElse(null);
        if (u == null)
            return ResponseEntity.status(401).body("Unauthorized: user not found");
        if (!u.isProviderApproved())
            return ResponseEntity.status(403).body("Provider account not approved");

        DataProduct dataset = new DataProduct(null, body.getTitle());
        dataset.setDescription(body.getDescription());
        dataset.setCategories(body.getCategories());
        dataset.setTags(body.getTags());
        dataset.setDataType(body.getDataType());
        dataset.setFormat(body.getFormat());
        dataset.setSizeBytes(body.getSizeBytes());
        dataset.setRegion(body.getRegion());
        dataset.setStartTime(body.getStartTime());
        dataset.setEndTime(body.getEndTime());
        dataset.setStatus(ProductStatus.PENDING_REVIEW);

        dataProductRepository.save(dataset);
        return ResponseEntity.ok("✅ Dataset metadata uploaded successfully, awaiting admin review");
    }

    // ------------------- API PUT: Định nghĩa chính sách dataset -------------------
    /**
     * API: PUT /api/provider/datasets/{id}/policy
     * Mục đích: Nhà cung cấp định nghĩa chính sách giá và quyền sử dụng cho dataset.
     * 
     * Body JSON ví dụ:
     * {
     *   "pricingModel": "subscription",
     *   "pricePerUse": 1000,
     *   "subscriptionPrice": 50000,
     *   "usageRights": "commercial, redistribution allowed"
     * }
     */
    @PutMapping("/datasets/{id}/policy")
    public ResponseEntity<?> defineDatasetPolicy(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> policy,
            HttpServletRequest req) {

        // 1️⃣ Xác thực Provider
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (roles == null || !roles.contains("Provider"))
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");

        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized: no email found");

        User u = userService.findByEmail(email).orElse(null);
        if (u == null)
            return ResponseEntity.status(401).body("Unauthorized: user not found");
        if (!u.isProviderApproved())
            return ResponseEntity.status(403).body("Provider account not approved");

        // 2️⃣ Tìm dataset
        DataProduct dataset = dataProductRepository.findById(id).orElse(null);
        if (dataset == null)
            return ResponseEntity.status(404).body("Dataset not found");

        // 3️⃣ Cập nhật chính sách giá và quyền sử dụng
        if (policy.containsKey("pricingModel"))
            dataset.getAttributes().put("pricingModel", policy.get("pricingModel").toString());

        if (policy.containsKey("pricePerUse"))
            dataset.getAttributes().put("pricePerUse", policy.get("pricePerUse").toString());

        if (policy.containsKey("subscriptionPrice"))
            dataset.getAttributes().put("subscriptionPrice", policy.get("subscriptionPrice").toString());

        if (policy.containsKey("usageRights"))
            dataset.getAttributes().put("usageRights", policy.get("usageRights").toString());

        dataset.setStatus(ProductStatus.PENDING_REVIEW);
        dataProductRepository.save(dataset);

        return ResponseEntity.ok("✅ Policy updated successfully and awaiting admin review");
    }
}
