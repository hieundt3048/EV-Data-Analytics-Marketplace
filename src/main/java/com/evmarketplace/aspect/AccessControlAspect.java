package com.evmarketplace.aspect;

import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Service.AccessControlService;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.marketplace.AccessType;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Aspect
@Component
public class AccessControlAspect {

    private static final Logger logger = LoggerFactory.getLogger(AccessControlAspect.class);

    private final AccessControlService accessControlService;
    private final UserRepository userRepository;

    public AccessControlAspect(AccessControlService accessControlService, UserRepository userRepository) {
        this.accessControlService = accessControlService;
        this.userRepository = userRepository;
    }

    @Before("@annotation(RequiresDatasetAccess) && args(datasetId, ..)")
    public void checkDatasetAccess(UUID datasetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);

        if (!accessControlService.hasAccess(userId, datasetId, AccessType.DOWNLOAD)) {
            throw new SecurityException("Access denied to dataset: " + datasetId);
        }
    }

    @Before("@annotation(RequiresDashboardAccess) && args(datasetId, ..)")
    public void checkDashboardAccess(UUID datasetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);

        if (!accessControlService.hasAccess(userId, datasetId, AccessType.API)) {
            throw new SecurityException("Dashboard access denied to dataset: " + datasetId);
        }
    }

    private UUID getUserIdFromUsername(String username) {
        // Map the authentication principal (username/email) to a User entity and return a deterministic UUID based on the user id.
        try {
            Optional<User> u = userRepository.findByEmail(username);
            if (u.isPresent()) {
                Long id = u.get().getId();
                return UUID.nameUUIDFromBytes(String.valueOf(id).getBytes());
            } else {
                logger.warn("No user found for principal '{}', falling back to name-based UUID", username);
                return UUID.nameUUIDFromBytes(username.getBytes());
            }
        } catch (Exception ex) {
            logger.error("Error mapping username to user id: {}", ex.getMessage());
            throw new SecurityException("Unable to resolve user id for principal");
        }
    }
}