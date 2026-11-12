package com.smartcrop.controller;

import com.smartcrop.dto.AdminDtos.AdminStats;
import com.smartcrop.dto.AdminDtos.WeightsDto;
import com.smartcrop.service.AdminService;
import com.smartcrop.service.WeightsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Admin-only endpoints (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService admin;
    private final WeightsService weights;

    @GetMapping("/stats")
    public AdminStats stats() {
        return admin.stats();
    }

    @GetMapping("/weights")
    public WeightsDto getWeights() {
        return weights.getDto();
    }

    @PutMapping("/weights")
    public WeightsDto updateWeights(@Valid @RequestBody WeightsDto dto) {
        return weights.update(dto);
    }
}
