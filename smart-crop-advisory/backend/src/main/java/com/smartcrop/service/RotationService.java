package com.smartcrop.service;

import com.smartcrop.dto.PlanDtos.RotationOption;
import com.smartcrop.dto.PlanDtos.RotationPlan;
import com.smartcrop.dto.PlanDtos.RotationStep;
import com.smartcrop.model.Crop;
import com.smartcrop.model.Season;
import com.smartcrop.repository.CropRepository;
import com.smartcrop.util.Num;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/** Crop-rotation rules: predecessor/successor compatibility, nitrogen fixation and category diversity. */
@Service
@RequiredArgsConstructor
public class RotationService {

    private final CropRepository crops;

    public record Compat(double score, String reason) {}

    /** How well does {@code candidate} follow {@code previousCrop}? 0-100 with an explanation. */
    public Compat compatibility(String previousCrop, Crop candidate) {
        if (previousCrop == null || previousCrop.isBlank() || previousCrop.equalsIgnoreCase("none")) {
            return new Compat(75, "No previous crop recorded, so rotation is treated as neutral.");
        }
        Optional<Crop> found = crops.findByNameIgnoreCase(previousCrop.trim());
        if (found.isEmpty()) {
            return new Compat(75, "Previous crop '" + previousCrop + "' is not in the crop database; rotation treated as neutral.");
        }
        Crop prev = found.get();
        if (prev.getName().equalsIgnoreCase(candidate.getName())) {
            return new Compat(20, "Repeating " + candidate.getName() + " after " + prev.getName()
                    + " raises pest, disease and nutrient-depletion risk.");
        }
        if (prev.isNitrogenFixing() && !candidate.isNitrogenFixing()) {
            return new Compat(100, prev.getName() + " fixes nitrogen, so " + candidate.getName()
                    + " benefits from the enriched soil.");
        }
        if (prev.getCategory() == candidate.getCategory()) {
            return new Compat(40, "Both are " + label(candidate) + " crops; rotating within the same category"
                    + " limits soil-health benefits.");
        }
        if (candidate.isNitrogenFixing() && !prev.isNitrogenFixing()) {
            return new Compat(90, candidate.getName() + " is a legume that restores nitrogen after "
                    + prev.getName() + ".");
        }
        return new Compat(80, "Switching from " + label(prev) + " to " + label(candidate)
                + " diversifies the rotation.");
    }

    /** Builds the rotation plan shown on the farm-plan page for the selected crop. */
    public RotationPlan plan(String previousCrop, Crop selected) {
        List<Crop> all = crops.findAll();
        Compat current = compatibility(previousCrop, selected);

        Season next = nextSeason(selected.getSeason());
        List<RotationOption> options = rank(all, selected, next).stream()
                .limit(5)
                .map(c -> toOption(selected, c))
                .toList();

        List<RotationStep> sequence = new ArrayList<>();
        sequence.add(new RotationStep(selected.getSeason().name(), selected.getName(), current.reason()));
        Crop cursor = selected;
        Season season = next;
        for (int i = 0; i < 2; i++) {
            List<Crop> ranked = rank(all, cursor, season);
            if (ranked.isEmpty()) {
                break;
            }
            Crop best = ranked.get(0);
            sequence.add(new RotationStep(season.name(), best.getName(),
                    compatibility(cursor.getName(), best).reason()));
            cursor = best;
            season = nextSeason(season);
        }

        String prevLabel = previousCrop == null || previousCrop.isBlank() ? "None" : previousCrop;
        return new RotationPlan(prevLabel, current.score(), current.reason(), options, sequence);
    }

    private List<Crop> rank(List<Crop> all, Crop after, Season season) {
        return all.stream()
                .filter(c -> c.getSeason() == season)
                .filter(c -> !c.getName().equalsIgnoreCase(after.getName()))
                .sorted(Comparator
                        .comparingDouble((Crop c) -> compatibility(after.getName(), c).score()).reversed()
                        .thenComparing(Crop::getName))
                .toList();
    }

    private RotationOption toOption(Crop after, Crop c) {
        Compat compat = compatibility(after.getName(), c);
        return new RotationOption(c.getName(), c.getCategory().name(), c.getSeason().name(),
                Num.r1(compat.score()), compat.reason());
    }

    private Season nextSeason(Season s) {
        return switch (s) {
            case KHARIF -> Season.RABI;
            case RABI -> Season.ZAID;
            case ZAID -> Season.KHARIF;
            case YEAR_ROUND -> Season.RABI;
        };
    }

    private String label(Crop c) {
        return c.getCategory().name().toLowerCase(Locale.ROOT).replace('_', ' ');
    }
}
