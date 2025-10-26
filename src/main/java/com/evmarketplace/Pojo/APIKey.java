// Mục đích: Mô hình khoá API (APIKey) cho consumer.
// Đáp ứng: Đại diện entity APIKey trong class diagram, chứa key, scopes, hạn mức và thời hạn.
package com.evmarketplace.Pojo;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public class APIKey {
    public UUID id;
    public UUID consumerId;
    public String key;
    public List<String> scopes;
    public int rateLimit;
    public Date expiresAt;

    public APIKey() {}

    // TODO: add revoke(), persistence annotations
}
