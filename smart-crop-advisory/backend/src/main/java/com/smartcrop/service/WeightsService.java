package com.smartcrop.service;

import com.smartcrop.dto.AdminDtos.WeightsDto;
import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.ScoringWeights;
import com.smartcrop.repository.WeightsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WeightsService {

    private final WeightsRepository repo;

    @Cacheable("weights")
    public ScoringWeights get() {
        return repo.findById(1L).orElseGet(() -> repo.save(new ScoringWeights()));
    }

    public WeightsDto getDto() {
        return toDto(get());
    }

    @CacheEvict(value = "weights", allEntries = true)
    public WeightsDto update(WeightsDto d) {
        double sum = d.soil() + d.season() + d.water() + d.ph() + d.rotation() + d.temperature() + d.rainfall();
        if (sum <= 0) {
            throw new ApiExceptions.BadRequest("At least one weight must be greater than zero.");
        }
        ScoringWeights w = repo.findById(1L).orElseGet(ScoringWeights::new);
        w.setSoil(d.soil());
        w.setSeason(d.season());
        w.setWater(d.water());
        w.setPh(d.ph());
        w.setRotation(d.rotation());
        w.setTemperature(d.temperature());
        w.setRainfall(d.rainfall());
        return toDto(repo.save(w));
    }

    private WeightsDto toDto(ScoringWeights w) {
        return new WeightsDto(w.getSoil(), w.getSeason(), w.getWater(), w.getPh(),
                w.getRotation(), w.getTemperature(), w.getRainfall());
    }
}
