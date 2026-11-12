package com.smartcrop.controller;

import com.smartcrop.dto.PlanDtos.RotationPlan;
import com.smartcrop.service.CropService;
import com.smartcrop.service.RotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rotation")
@RequiredArgsConstructor
public class RotationController {

    private final RotationService rotation;
    private final CropService crops;

    /** Rotation advice for growing {@code cropId} after {@code previousCrop}. */
    @GetMapping
    public RotationPlan plan(@RequestParam(required = false) String previousCrop,
                             @RequestParam Long cropId) {
        return rotation.plan(previousCrop, crops.get(cropId));
    }
}
