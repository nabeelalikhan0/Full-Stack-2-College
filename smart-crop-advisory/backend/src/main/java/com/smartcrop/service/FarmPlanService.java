package com.smartcrop.service;

import com.smartcrop.dto.PlanDtos.FarmPlan;
import com.smartcrop.dto.PlanDtos.IrrigationPlan;
import com.smartcrop.dto.PlanDtos.ResourcePlan;
import com.smartcrop.dto.PlanDtos.RotationPlan;
import com.smartcrop.dto.RecommendationDtos.CropScore;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.dto.RecommendationDtos.RecommendationResponse;
import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.AppUser;
import com.smartcrop.model.Crop;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/** Expands one recommended crop into a full farm plan: irrigation + rotation + resources. */
@Service
@RequiredArgsConstructor
public class FarmPlanService {

    private final RecommendationService recommendations;
    private final CropService cropService;
    private final IrrigationService irrigation;
    private final RotationService rotation;
    private final ResourceService resources;

    public FarmPlan build(AppUser user, Long recommendationId, Long cropId) {
        RecommendationResponse rec = recommendations.get(user, recommendationId);
        CropScore score = rec.results().stream()
                .filter(r -> r.cropId().equals(cropId))
                .findFirst()
                .orElseThrow(() -> new ApiExceptions.NotFound("Crop was not part of this recommendation"));
        Crop crop = cropService.get(cropId);
        FarmInput in = rec.input();

        IrrigationPlan irr = irrigation.plan(in, crop);
        RotationPlan rot = rotation.plan(in.previousCrop(), crop);
        ResourcePlan res = resources.plan(in, crop, irr);

        Instant now = Instant.now();
        String advisoryId = "ADV-" + DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(now)
                + "-" + recommendationId + "-" + cropId;
        return new FarmPlan(advisoryId, recommendationId, now, in, score, irr, rot, res);
    }
}
