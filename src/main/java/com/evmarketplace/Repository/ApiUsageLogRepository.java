package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.ApiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, Long> {
    
    List<ApiUsageLog> findByApiKeyId(Long apiKeyId);
    
    List<ApiUsageLog> findByApiKeyIdAndTimestampBetween(Long apiKeyId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(a) FROM ApiUsageLog a WHERE a.apiKeyId = :apiKeyId AND a.timestamp >= :since")
    Long countRequestsSince(@Param("apiKeyId") Long apiKeyId, @Param("since") LocalDateTime since);
    
    @Query("SELECT SUM(a.bytesTransferred) FROM ApiUsageLog a WHERE a.apiKeyId = :apiKeyId AND a.datasetId = :datasetId")
    Long getTotalBytesTransferred(@Param("apiKeyId") Long apiKeyId, @Param("datasetId") Long datasetId);
    
    @Query("SELECT a.endpoint, COUNT(a) FROM ApiUsageLog a WHERE a.apiKeyId = :apiKeyId GROUP BY a.endpoint ORDER BY COUNT(a) DESC")
    List<Object[]> getTopEndpoints(@Param("apiKeyId") Long apiKeyId);
}