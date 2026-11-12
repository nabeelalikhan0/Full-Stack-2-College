package com.smartcrop.service;

import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.Crop;
import com.smartcrop.model.CropStage;
import com.smartcrop.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository repo;

    @Cacheable("crops")
    public List<Crop> findAll() {
        return repo.findAll(Sort.by("name"));
    }

    public Crop get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ApiExceptions.NotFound("Crop not found: " + id));
    }

    @CacheEvict(value = "crops", allEntries = true)
    public Crop create(Crop in) {
        if (repo.existsByNameIgnoreCase(in.getName())) {
            throw new ApiExceptions.Conflict("A crop named '" + in.getName() + "' already exists");
        }
        in.setId(null);
        ensureStages(in);
        return repo.save(in);
    }

    @CacheEvict(value = "crops", allEntries = true)
    @Transactional
    public Crop update(Long id, Crop in) {
        Crop c = get(id);
        repo.findByNameIgnoreCase(in.getName()).ifPresent(other -> {
            if (!other.getId().equals(id)) {
                throw new ApiExceptions.Conflict("A crop named '" + in.getName() + "' already exists");
            }
        });
        c.setName(in.getName());
        c.setCategory(in.getCategory());
        c.setSeason(in.getSeason());
        c.getSuitableSoils().clear();
        c.getSuitableSoils().addAll(in.getSuitableSoils());
        c.setWaterReqMm(in.getWaterReqMm());
        c.setPhMin(in.getPhMin());
        c.setPhMax(in.getPhMax());
        c.setTempMin(in.getTempMin());
        c.setTempMax(in.getTempMax());
        c.setRainfallMinMm(in.getRainfallMinMm());
        c.setDurationDays(in.getDurationDays());
        c.setYieldQtlPerHa(in.getYieldQtlPerHa());
        c.setRisk(in.getRisk());
        c.setNitrogenFixing(in.isNitrogenFixing());
        c.setSeedKgPerHa(in.getSeedKgPerHa());
        c.setSeedPricePerKg(in.getSeedPricePerKg());
        c.setNKgPerHa(in.getNKgPerHa());
        c.setPKgPerHa(in.getPKgPerHa());
        c.setKKgPerHa(in.getKKgPerHa());
        c.setLabourDaysPerHa(in.getLabourDaysPerHa());
        c.setBaseCostPerHa(in.getBaseCostPerHa());
        List<CropStage> stages = in.getStages() == null || in.getStages().isEmpty()
                ? defaultStages(in.getDurationDays())
                : in.getStages();
        c.getStages().clear();
        c.getStages().addAll(stages);
        return repo.save(c);
    }

    @CacheEvict(value = "crops", allEntries = true)
    public void delete(Long id) {
        repo.delete(get(id));
    }

    private void ensureStages(Crop c) {
        if (c.getStages() == null || c.getStages().isEmpty()) {
            c.setStages(defaultStages(c.getDurationDays()));
        }
    }

    /** Generic four-stage water profile; the flowering / grain-filling stage is the critical one. */
    public static List<CropStage> defaultStages(int totalDays) {
        int d = Math.max(totalDays, 4);
        int s1 = Math.round(d * 0.15f);
        int s2 = Math.round(d * 0.30f);
        int s3 = Math.round(d * 0.30f);
        int s4 = Math.max(1, d - s1 - s2 - s3);
        List<CropStage> list = new ArrayList<>();
        list.add(new CropStage("Establishment", s1, 0.15, false));
        list.add(new CropStage("Vegetative growth", s2, 0.30, false));
        list.add(new CropStage("Flowering / grain filling", s3, 0.35, true));
        list.add(new CropStage("Maturity", s4, 0.20, false));
        return list;
    }
}
