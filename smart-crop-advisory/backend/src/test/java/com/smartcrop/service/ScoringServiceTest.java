package com.smartcrop.service;

import com.smartcrop.dto.RecommendationDtos.CropScore;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.model.Category;
import com.smartcrop.model.Crop;
import com.smartcrop.model.RiskLevel;
import com.smartcrop.model.ScoringWeights;
import com.smartcrop.model.Season;
import com.smartcrop.model.WaterLevel;
import com.smartcrop.repository.CropRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ScoringServiceTest {

    private CropRepository repo;
    private ScoringService scoring;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(CropRepository.class);
        scoring = new ScoringService(new ReferenceDataService(), new RotationService(repo));
    }

    private Crop wheat() {
        Crop c = new Crop();
        c.setId(1L);
        c.setName("Wheat");
        c.setCategory(Category.CEREAL);
        c.setSeason(Season.RABI);
        c.setSuitableSoils(new LinkedHashSet<>(Set.of("Alluvial", "Loamy")));
        c.setWaterReqMm(450);
        c.setPhMin(6.0);
        c.setPhMax(7.5);
        c.setTempMin(12);
        c.setTempMax(25);
        c.setRainfallMinMm(100);
        c.setDurationDays(130);
        c.setYieldQtlPerHa(45);
        c.setRisk(RiskLevel.LOW);
        return c;
    }

    private FarmInput farm(String soil, double ph, Season season) {
        return new FarmInput("Punjab", "Ludhiana", 2.0, soil, ph, WaterLevel.HIGH,
                "Sprinkler", season, null, 18.0, 120.0);
    }

    @Test
    void idealConditionsGiveHighScore() {
        CropScore s = scoring.score(farm("Alluvial", 6.8, Season.RABI), wheat(), new ScoringWeights());

        assertEquals(7, s.factors().size());
        assertTrue(s.score() >= 90, "expected >= 90 but was " + s.score());
        assertEquals("Highly Suitable", s.label());
        assertTrue(s.warnings().isEmpty());
    }

    @Test
    void wrongSeasonAndSoilLowersScoreAndWarns() {
        CropScore s = scoring.score(farm("Black", 6.8, Season.KHARIF), wheat(), new ScoringWeights());

        assertTrue(s.score() < 70, "expected < 70 but was " + s.score());
        assertFalse(s.warnings().isEmpty());
    }

    @Test
    void repeatingTheSameCropIsPenalisedInRotation() {
        when(repo.findByNameIgnoreCase("Wheat")).thenReturn(Optional.of(wheat()));
        FarmInput in = new FarmInput("Punjab", "Ludhiana", 2.0, "Alluvial", 6.8, WaterLevel.HIGH,
                "Sprinkler", Season.RABI, "Wheat", 18.0, 120.0);

        CropScore s = scoring.score(in, wheat(), new ScoringWeights());

        double rotation = s.factors().stream()
                .filter(f -> f.factor().equals("Crop rotation"))
                .findFirst().orElseThrow().score();
        assertEquals(20.0, rotation, 0.001);
    }
}
