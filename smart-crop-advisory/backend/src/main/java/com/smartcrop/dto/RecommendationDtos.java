package com.smartcrop.dto;

import com.smartcrop.model.Category;
import com.smartcrop.model.RiskLevel;
import com.smartcrop.model.Season;
import com.smartcrop.model.WaterLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;
import java.util.List;

public final class RecommendationDtos {
    private RecommendationDtos() {}

    /** Everything the farmer tells us about the farm (steps 1-3 of the wizard). */
    public record FarmInput(
            @NotBlank String state,
            String district,
            @NotNull @Positive Double landAreaHa,
            @NotBlank String soilType,
            @NotNull @DecimalMin("3.0") @DecimalMax("10.0") Double soilPh,
            @NotNull WaterLevel waterAvailability,
            @NotBlank String irrigationMethod,
            @NotNull Season season,
            String previousCrop,
            @NotNull @DecimalMin("-5.0") @DecimalMax("55.0") Double temperatureC,
            @NotNull @PositiveOrZero Double rainfallMm) {}

    public record FactorScore(String factor, double weight, double score, String reasoning) {}

    public record CropScore(Long cropId, String crop, Category category, Season season,
                            double score, String label, RiskLevel risk,
                            double waterReqMm, int durationDays, double yieldQtlPerHa,
                            List<FactorScore> factors, List<String> warnings, int rank) {
        public CropScore withRank(int r) {
            return new CropScore(cropId, crop, category, season, score, label, risk,
                    waterReqMm, durationDays, yieldQtlPerHa, factors, warnings, r);
        }
    }

    public record RecommendationResponse(Long id, Instant createdAt, FarmInput input, List<CropScore> results) {}

    public record HistoryItem(Long id, Instant createdAt, String state, String district,
                              String soilType, String season, double landAreaHa,
                              String topCrop, double topScore) {}
}
