package com.smartcrop.service;

import com.smartcrop.config.AppProperties;
import com.smartcrop.dto.PlanDtos.IrrigationPlan;
import com.smartcrop.dto.PlanDtos.ResourcePlan;
import com.smartcrop.dto.RecommendationDtos.FarmInput;
import com.smartcrop.model.Crop;
import com.smartcrop.util.Num;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Estimates seed, fertilizer, labour, water, cost and yield for a farm plan. */
@Service
@RequiredArgsConstructor
public class ResourceService {

    private static final double UREA_N = 0.46;   // 46-0-0
    private static final double DAP_N = 0.18;    // 18-46-0
    private static final double DAP_P = 0.46;
    private static final double MOP_K = 0.60;    // 0-0-60

    private final AppProperties props;

    public ResourcePlan plan(FarmInput in, Crop crop, IrrigationPlan irrigation) {
        AppProperties.Pricing price = props.pricing();
        double area = in.landAreaHa();

        double seedKg = crop.getSeedKgPerHa() * area;
        double seedCost = seedKg * crop.getSeedPricePerKg();

        double n = crop.getNKgPerHa() * area;
        double p = crop.getPKgPerHa() * area;
        double k = crop.getKKgPerHa() * area;
        double dap = p / DAP_P;
        double nFromDap = dap * DAP_N;
        double urea = Math.max(0, n - nFromDap) / UREA_N;
        double mop = k / MOP_K;
        double fertilizerCost = urea * price.ureaPerKg() + dap * price.dapPerKg() + mop * price.mopPerKg();

        double labourDays = crop.getLabourDaysPerHa() * area;
        double labourCost = labourDays * price.labourPerDay();

        double waterM3 = irrigation.totalVolumeM3();
        double irrigationCost = waterM3 * price.waterPerM3();

        double other = crop.getBaseCostPerHa() * area;
        double total = seedCost + fertilizerCost + labourCost + irrigationCost + other;
        double yield = crop.getYieldQtlPerHa() * area;
        double perQuintal = yield > 0 ? total / yield : 0;

        return new ResourcePlan(Num.r1(seedKg), Num.r2(seedCost),
                Num.r1(urea), Num.r1(dap), Num.r1(mop), Num.r2(fertilizerCost),
                Num.r1(labourDays), Num.r2(labourCost),
                Num.r1(waterM3), Num.r2(irrigationCost),
                Num.r2(other), Num.r2(total), Num.r1(yield), Num.r2(perQuintal));
    }
}
