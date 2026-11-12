package com.smartcrop.service;

import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.WaterLevel;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Static agricultural reference data: soils, irrigation methods, regions and water levels. */
@Service
public class ReferenceDataService {

    public record Soil(String name, String description) {}

    public record IrrigationMethod(String name, double efficiency, String description) {}

    public record Region(String state, String district, String soil, double annualRainMm,
                         double tempKharif, double tempRabi, double tempZaid) {}

    private final List<Soil> soils = List.of(
            new Soil("Alluvial", "Fertile river-deposited soil with good moisture retention"),
            new Soil("Black", "Clay-rich regur soil that holds water well; ideal for cotton"),
            new Soil("Red", "Iron-rich, well-drained soil; moderate fertility"),
            new Soil("Laterite", "Acidic, leached soil of high-rainfall zones"),
            new Soil("Sandy", "Light, fast-draining soil of arid and semi-arid zones"),
            new Soil("Clay", "Heavy, water-retentive soil suited to flooded crops"),
            new Soil("Loamy", "Balanced sand-silt-clay mix; versatile for most crops"));

    private final List<IrrigationMethod> methods = List.of(
            new IrrigationMethod("Flood", 0.50, "Surface flooding; simple but wasteful"),
            new IrrigationMethod("Furrow", 0.60, "Water runs along furrows between crop rows"),
            new IrrigationMethod("Check Basin", 0.55, "Level basins filled and allowed to soak"),
            new IrrigationMethod("Sprinkler", 0.75, "Overhead spray; good for uneven land"),
            new IrrigationMethod("Drip", 0.90, "Water delivered at the root zone; most efficient"));

    private final List<Region> regions = List.of(
            new Region("Punjab", "Ludhiana", "Alluvial", 700, 30, 15, 32),
            new Region("Haryana", "Karnal", "Alluvial", 650, 30, 15, 32),
            new Region("Uttar Pradesh", "Lucknow", "Alluvial", 1000, 30, 18, 33),
            new Region("Bihar", "Patna", "Alluvial", 1100, 30, 19, 33),
            new Region("West Bengal", "Bardhaman", "Alluvial", 1400, 29, 21, 31),
            new Region("Madhya Pradesh", "Indore", "Black", 950, 27, 19, 31),
            new Region("Maharashtra", "Nagpur", "Black", 1100, 28, 22, 33),
            new Region("Gujarat", "Rajkot", "Black", 600, 29, 22, 33),
            new Region("Rajasthan", "Jodhpur", "Sandy", 350, 31, 19, 34),
            new Region("Karnataka", "Dharwad", "Red", 800, 25, 22, 29),
            new Region("Tamil Nadu", "Coimbatore", "Red", 650, 28, 24, 30),
            new Region("Andhra Pradesh", "Guntur", "Black", 900, 30, 24, 34),
            new Region("Telangana", "Warangal", "Red", 950, 29, 23, 33),
            new Region("Odisha", "Cuttack", "Laterite", 1450, 29, 23, 31),
            new Region("Kerala", "Thrissur", "Laterite", 3000, 27, 27, 29));

    public Map<String, Object> all() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("soils", soils);
        m.put("irrigationMethods", methods);
        m.put("regions", regions);
        m.put("seasons", List.of("KHARIF", "RABI", "ZAID"));
        m.put("waterLevels", List.of(
                Map.of("level", "LOW", "mm", 300),
                Map.of("level", "MEDIUM", "mm", 600),
                Map.of("level", "HIGH", "mm", 1000)));
        return m;
    }

    /** Fraction of applied water that actually reaches the crop. */
    public double efficiency(String method) {
        return methods.stream()
                .filter(x -> x.name().equalsIgnoreCase(method))
                .findFirst()
                .map(IrrigationMethod::efficiency)
                .orElseThrow(() -> new ApiExceptions.BadRequest("Unknown irrigation method: " + method));
    }

    /** Seasonal irrigation water the farmer can draw on, in mm over the field. */
    public double waterMm(WaterLevel level) {
        return switch (level) {
            case LOW -> 300;
            case MEDIUM -> 600;
            case HIGH -> 1000;
        };
    }
}
