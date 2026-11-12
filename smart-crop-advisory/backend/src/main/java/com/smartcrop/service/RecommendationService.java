package com.smartcrop.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcrop.dto.RecommendationDtos.CropScore;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.dto.RecommendationDtos.HistoryItem;
import com.smartcrop.dto.RecommendationDtos.RecommendationResponse;
import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.AppUser;
import com.smartcrop.model.Crop;
import com.smartcrop.model.RecommendationRecord;
import com.smartcrop.model.Role;
import com.smartcrop.model.ScoringWeights;
import com.smartcrop.model.Season;
import com.smartcrop.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final CropService cropService;
    private final WeightsService weights;
    private final ScoringService scoring;
    private final RecommendationRepository repo;
    private final ObjectMapper mapper;

    @CacheEvict(value = "stats", allEntries = true)
    public RecommendationResponse create(AppUser user, FarmInput in) {
        if (in.season() == Season.YEAR_ROUND) {
            throw new ApiExceptions.BadRequest("Season must be KHARIF, RABI or ZAID.");
        }
        List<Crop> all = cropService.findAll();
        if (all.isEmpty()) {
            throw new ApiExceptions.BadRequest("No crops are configured.");
        }
        ScoringWeights w = weights.get();

        List<CropScore> sorted = all.stream()
                .map(c -> scoring.score(in, c, w))
                .sorted(Comparator.<CropScore>comparingDouble(CropScore::score).reversed())
                .toList();
        List<CropScore> ranked = IntStream.range(0, sorted.size())
                .mapToObj(i -> sorted.get(i).withRank(i + 1))
                .toList();

        RecommendationRecord rec = new RecommendationRecord();
        rec.setUser(user);
        rec.setState(in.state());
        rec.setDistrict(in.district());
        rec.setSoilType(in.soilType());
        rec.setSeason(in.season().name());
        rec.setPreviousCrop(in.previousCrop());
        rec.setLandAreaHa(in.landAreaHa());
        rec.setTopCrop(ranked.get(0).crop());
        rec.setTopScore(ranked.get(0).score());
        rec.setInputJson(toJson(in));
        rec.setResultJson(toJson(ranked));
        rec = repo.save(rec);

        return new RecommendationResponse(rec.getId(), rec.getCreatedAt(), in, ranked);
    }

    public List<HistoryItem> history(AppUser user) {
        return repo.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> new HistoryItem(r.getId(), r.getCreatedAt(), r.getState(), r.getDistrict(),
                        r.getSoilType(), r.getSeason(), r.getLandAreaHa(), r.getTopCrop(), r.getTopScore()))
                .toList();
    }

    public RecommendationResponse get(AppUser user, Long id) {
        RecommendationRecord r = repo.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFound("Recommendation not found"));
        boolean owner = r.getUser().getId().equals(user.getId());
        if (!owner && user.getRole() != Role.ADMIN) {
            throw new ApiExceptions.NotFound("Recommendation not found");
        }
        try {
            FarmInput input = mapper.readValue(r.getInputJson(), FarmInput.class);
            List<CropScore> results = mapper.readValue(r.getResultJson(), new TypeReference<List<CropScore>>() {});
            return new RecommendationResponse(r.getId(), r.getCreatedAt(), input, results);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored recommendation could not be read", e);
        }
    }

    private String toJson(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialise recommendation", e);
        }
    }
}
