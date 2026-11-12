package com.smartcrop.service;

import com.smartcrop.dto.PlanDtos.IrrigationPlan;
import com.smartcrop.dto.PlanDtos.IrrigationStage;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.model.Crop;
import com.smartcrop.model.CropStage;
import com.smartcrop.util.Num;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Stage-wise irrigation schedule and water balance.
 * 1 mm of water over 1 hectare = 10 m3.
 */
@Service
@RequiredArgsConstructor
public class IrrigationService {

    private static final double EFFECTIVE_RAIN_FACTOR = 0.75;

    private final ReferenceDataService ref;

    public IrrigationPlan plan(FarmInput in, Crop crop) {
        double area = in.landAreaHa();
        double efficiency = ref.efficiency(in.irrigationMethod());
        double need = crop.getWaterReqMm();

        double effectiveRain = Math.min(need, EFFECTIVE_RAIN_FACTOR * in.rainfallMm());
        double net = need - effectiveRain;
        double gross = net / efficiency;
        double totalVolume = gross * 10 * area;

        List<CropStage> stages = crop.getStages();
        double fractionSum = stages.stream().mapToDouble(CropStage::getWaterFraction).sum();
        if (fractionSum <= 0) {
            fractionSum = 1;
        }

        List<IrrigationStage> schedule = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        int day = 1;
        for (CropStage st : stages) {
            double mm = gross * st.getWaterFraction() / fractionSum;
            int end = day + Math.max(st.getDays(), 1) - 1;
            schedule.add(new IrrigationStage(st.getName(), day, end, Num.r1(mm), Num.r1(mm * 10 * area), st.isCritical()));
            if (st.isCritical()) {
                warnings.add(String.format(Locale.ROOT,
                        "Critical stage: avoid water stress during %s (days %d-%d).", st.getName(), day, end));
            }
            day = end + 1;
        }

        double available = ref.waterMm(in.waterAvailability());
        double balance = available - gross;
        String status = balance >= 0 ? "SURPLUS" : "DEFICIT";
        if (balance < 0) {
            warnings.add(String.format(Locale.ROOT,
                    "Seasonal water deficit of %.0f mm. Consider drip or sprinkler irrigation, or prioritise the critical stage.",
                    -balance));
        }
        if (net == 0) {
            warnings.add("Rainfall alone may meet this crop's water need; irrigate only during dry spells.");
        }

        return new IrrigationPlan(crop.getName(), area, in.irrigationMethod(), efficiency,
                need, Num.r1(effectiveRain), Num.r1(net), Num.r1(gross), Num.r1(totalVolume),
                available, Num.r1(balance), status, schedule, warnings);
    }
}
