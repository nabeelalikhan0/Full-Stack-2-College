package com.smartcrop.dto;

import com.smartcrop.dto.RecommendationDtos.CropScore;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public final class PlanDtos {
    private PlanDtos() {}

    public record IrrigationStage(String stage, int startDay, int endDay,
                                  double waterMm, double volumeM3, boolean critical) {}

    public record IrrigationPlan(String crop, double areaHa, String method, double efficiency,
                                 double cropWaterMm, double effectiveRainMm,
                                 double netIrrigationMm, double grossIrrigationMm,
                                 double totalVolumeM3, double availableWaterMm, double balanceMm,
                                 String status, List<IrrigationStage> schedule, List<String> warnings) {}

    public record RotationOption(String crop, String category, String season, double score, String reason) {}

    public record RotationStep(String season, String crop, String note) {}

    public record RotationPlan(String previousCrop, double compatibilityScore, String compatibilityNote,
                               List<RotationOption> nextOptions, List<RotationStep> sequence) {}

    public record ResourcePlan(double seedKg, double seedCost,
                               double ureaKg, double dapKg, double mopKg, double fertilizerCost,
                               double labourDays, double labourCost,
                               double waterM3, double irrigationCost,
                               double otherCultivationCost, double totalCost,
                               double expectedYieldQtl, double costPerQuintal) {}

    public record FarmPlan(String advisoryId, Long recommendationId, Instant generatedAt,
                           FarmInput input, CropScore crop,
                           IrrigationPlan irrigation, RotationPlan rotation, ResourcePlan resources) {}

    public record IrrigationRequest(@NotNull Long cropId, @NotNull @Valid FarmInput farm) {}
}
