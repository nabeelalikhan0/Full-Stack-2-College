package com.smartcrop.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Agronomic profile of a crop. Managed by administrators. */
@Entity
@Table(name = "crops")
@Getter
@Setter
@NoArgsConstructor
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Category category;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Season season;

    @NotEmpty
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crop_soils", joinColumns = @JoinColumn(name = "crop_id"))
    @Column(name = "soil")
    private Set<String> suitableSoils = new LinkedHashSet<>();

    @Positive
    private double waterReqMm;
    private double phMin;
    private double phMax;
    private double tempMin;
    private double tempMax;
    private double rainfallMinMm;

    @Positive
    private int durationDays;
    private double yieldQtlPerHa;

    @Enumerated(EnumType.STRING)
    private RiskLevel risk = RiskLevel.MEDIUM;

    private boolean nitrogenFixing;

    private double seedKgPerHa;
    private double seedPricePerKg;
    private double nKgPerHa;
    private double pKgPerHa;
    private double kKgPerHa;
    private double labourDaysPerHa;
    private double baseCostPerHa;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crop_stages", joinColumns = @JoinColumn(name = "crop_id"))
    @OrderColumn(name = "stage_order")
    private List<CropStage> stages = new ArrayList<>();
}
