package com.smartcrop.service;

import com.smartcrop.dto.RecommendationDtos.CropScore;
import com.smartcrop.dto.RecommendationDtos.FactorScore;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.model.Crop;
import com.smartcrop.model.ScoringWeights;
import com.smartcrop.model.Season;
import com.smartcrop.util.Num;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Explainable, deterministic weighted scoring engine.
 * Seven factors are each scored 0-100 and combined with the (admin-configurable) weights.
 */
@Service
@RequiredArgsConstructor
public class ScoringService {

    private final ReferenceDataService ref;
    private final RotationService rotation;

    public CropScore score(FarmInput in, Crop crop, ScoringWeights w) {
        List<FactorScore> factors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // 1. Soil type ---------------------------------------------------------------
        boolean soilOk = crop.getSuitableSoils().stream().anyMatch(s -> s.equalsIgnoreCase(in.soilType()));
        double soil = soilOk ? 100 : 25;
        factors.add(new FactorScore("Soil type", w.getSoil(), soil, soilOk
                ? fmt("%s soil is well suited to %s.", in.soilType(), crop.getName())
                : fmt("%s prefers %s soils; %s soil is not ideal.", crop.getName(),
                        String.join("/", crop.getSuitableSoils()), in.soilType())));
        if (!soilOk) {
            warnings.add("Soil type is not among this crop's preferred soils.");
        }

        // 2. Season ------------------------------------------------------------------
        double season;
        String seasonMsg;
        if (crop.getSeason() == in.season()) {
            season = 100;
            seasonMsg = fmt("%s is a %s crop, matching your planting season.", crop.getName(), crop.getSeason());
        } else if (crop.getSeason() == Season.YEAR_ROUND) {
            season = 85;
            seasonMsg = fmt("%s can be planted across seasons.", crop.getName());
        } else {
            season = 20;
            seasonMsg = fmt("%s is normally grown in %s but you plan to sow in %s.",
                    crop.getName(), crop.getSeason(), in.season());
            warnings.add("Outside the crop's normal growing season.");
        }
        factors.add(new FactorScore("Season", w.getSeason(), season, seasonMsg));

        // 3. Water -------------------------------------------------------------------
        double efficiency = ref.efficiency(in.irrigationMethod());
        double supplyMm = ref.waterMm(in.waterAvailability()) * efficiency;
        double ratio = crop.getWaterReqMm() <= 0 ? 1 : supplyMm / crop.getWaterReqMm();
        double water = Math.min(100, ratio * 100);
        factors.add(new FactorScore("Water availability", w.getWater(), water,
                fmt("Needs %.0f mm; %s water with %s irrigation delivers about %.0f mm (%.0f%% of the need).",
                        crop.getWaterReqMm(), in.waterAvailability(), in.irrigationMethod(),
                        supplyMm, Math.min(ratio * 100, 999))));
        if (ratio < 0.8) {
            warnings.add(fmt("Water deficit of about %.0f mm for the season.", crop.getWaterReqMm() - supplyMm));
        }

        // 4. Soil pH -----------------------------------------------------------------
        double ph = in.soilPh();
        double phDist = ph < crop.getPhMin() ? crop.getPhMin() - ph : Math.max(0, ph - crop.getPhMax());
        double phScore = Math.max(0, 100 - 45 * phDist);
        factors.add(new FactorScore("Soil pH", w.getPh(), phScore, phDist == 0
                ? fmt("pH %.1f is inside the optimal range %.1f-%.1f.", ph, crop.getPhMin(), crop.getPhMax())
                : fmt("pH %.1f is %.1f units outside the optimal range %.1f-%.1f.",
                        ph, phDist, crop.getPhMin(), crop.getPhMax())));
        if (phDist > 0.5) {
            warnings.add("Soil pH is well outside the optimal range; consider lime or gypsum amendments.");
        }

        // 5. Crop rotation -----------------------------------------------------------
        RotationService.Compat rc = rotation.compatibility(in.previousCrop(), crop);
        factors.add(new FactorScore("Crop rotation", w.getRotation(), rc.score(), rc.reason()));
        if (rc.score() <= 40) {
            warnings.add("Rotation: " + rc.reason());
        }

        // 6. Temperature ----------------------------------------------------------------
        double t = in.temperatureC();
        double tDist = t < crop.getTempMin() ? crop.getTempMin() - t : Math.max(0, t - crop.getTempMax());
        double tScore = Math.max(0, 100 - 10 * tDist);
        factors.add(new FactorScore("Temperature", w.getTemperature(), tScore, tDist == 0
                ? fmt("%.0f\u00B0C is within the crop's range of %.0f-%.0f\u00B0C.", t, crop.getTempMin(), crop.getTempMax())
                : fmt("%.0f\u00B0C is %.1f\u00B0C outside the crop's range of %.0f-%.0f\u00B0C.",
                        t, tDist, crop.getTempMin(), crop.getTempMax())));
        if (tDist > 3) {
            warnings.add("Average temperature is far from the crop's comfortable range.");
        }

        // 7. Rainfall -------------------------------------------------------------------
        double rainRatio = crop.getRainfallMinMm() <= 0 ? 1 : in.rainfallMm() / crop.getRainfallMinMm();
        double rain = Math.min(100, rainRatio * 100);
        factors.add(new FactorScore("Rainfall", w.getRainfall(), rain,
                fmt("Seasonal rainfall of %.0f mm is %.0f%% of the %.0f mm this crop likes.",
                        in.rainfallMm(), Math.min(rainRatio * 100, 999), crop.getRainfallMinMm())));

        // Combine -----------------------------------------------------------------------
        List<FactorScore> rounded = factors.stream()
                .map(f -> new FactorScore(f.factor(), f.weight(), Num.r1(f.score()), f.reasoning()))
                .toList();
        double weightSum = rounded.stream().mapToDouble(FactorScore::weight).sum();
        double weighted = rounded.stream().mapToDouble(f -> f.weight() * f.score()).sum();
        double total = weightSum <= 0 ? 0 : Num.r1(weighted / weightSum);

        return new CropScore(crop.getId(), crop.getName(), crop.getCategory(), crop.getSeason(),
                total, label(total), crop.getRisk(), crop.getWaterReqMm(), crop.getDurationDays(),
                crop.getYieldQtlPerHa(), rounded, warnings, 0);
    }

    public static String label(double score) {
        if (score >= 80) return "Highly Suitable";
        if (score >= 65) return "Suitable";
        if (score >= 50) return "Moderately Suitable";
        return "Not Recommended";
    }

    private static String fmt(String pattern, Object... args) {
        return String.format(Locale.ROOT, pattern, args);
    }
}
