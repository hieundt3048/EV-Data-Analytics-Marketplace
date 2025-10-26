// Mục đích: Mô tả profile của nhà cung cấp (ProviderProfile).
// Đáp ứng: Đại diện ProviderProfile theo class diagram, lưu các thông tin như tên, mô tả, tài khoản ngân hàng, xếp hạng.
package com.evmarketplace.Pojo;

import java.util.UUID;

public class ProviderProfile {
    public UUID id;
    public UUID userId;
    public String providerName;
    public String description;
    public String bankAccount;
    public double rating; // simple numeric rating

    public ProviderProfile() {}

    // TODO: add behavior methods like uploadDataset(), setPricingPolicy(), persistence annotations
}
