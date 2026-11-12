package com.smartcrop.dto;

import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;
import java.util.List;

public final class AdminDtos {
    private AdminDtos() {}

    public record WeightsDto(@PositiveOrZero double soil, @PositiveOrZero double season,
                             @PositiveOrZero double water, @PositiveOrZero double ph,
                             @PositiveOrZero double rotation, @PositiveOrZero double temperature,
                             @PositiveOrZero double rainfall) {}

    public record NameCount(String name, long count) {}

    public record RecentItem(Long id, String user, String state, String topCrop,
                             double topScore, Instant createdAt) {}

    public record AdminStats(long totalUsers, long totalRecommendations, long totalCrops,
                             List<NameCount> popularCrops, List<NameCount> byState,
                             List<RecentItem> recent) {}
}
