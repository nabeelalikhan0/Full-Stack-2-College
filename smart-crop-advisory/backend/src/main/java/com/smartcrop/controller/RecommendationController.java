package com.smartcrop.controller;

import com.smartcrop.dto.PlanDtos.FarmPlan;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.dto.RecommendationDtos.HistoryItem;
import com.smartcrop.dto.RecommendationDtos.RecommendationResponse;
import com.smartcrop.service.AuthService;
import com.smartcrop.service.FarmPlanService;
import com.smartcrop.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendations;
    private final FarmPlanService plans;
    private final AuthService auth;

    @PostMapping
    public ResponseEntity<RecommendationResponse> create(@Valid @RequestBody FarmInput input,
                                                         Authentication authentication) {
        RecommendationResponse body = recommendations.create(auth.currentUser(authentication), input);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    public List<HistoryItem> history(Authentication authentication) {
        return recommendations.history(auth.currentUser(authentication));
    }

    @GetMapping("/{id}")
    public RecommendationResponse get(@PathVariable Long id, Authentication authentication) {
        return recommendations.get(auth.currentUser(authentication), id);
    }

    @GetMapping("/{id}/plan/{cropId}")
    public FarmPlan plan(@PathVariable Long id, @PathVariable Long cropId, Authentication authentication) {
        return plans.build(auth.currentUser(authentication), id, cropId);
    }
}
