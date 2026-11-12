package com.smartcrop.controller;

import com.smartcrop.dto.PlanDtos.IrrigationPlan;
import com.smartcrop.dto.PlanDtos.IrrigationRequest;
import com.smartcrop.service.CropService;
import com.smartcrop.service.IrrigationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/irrigation")
@RequiredArgsConstructor
public class IrrigationController {

    private final IrrigationService irrigation;
    private final CropService crops;

    /** Stand-alone calculator: water requirement + schedule for any crop and farm. */
    @PostMapping("/calculate")
    public IrrigationPlan calculate(@Valid @RequestBody IrrigationRequest request) {
        return irrigation.plan(request.farm(), crops.get(request.cropId()));
    }
}
