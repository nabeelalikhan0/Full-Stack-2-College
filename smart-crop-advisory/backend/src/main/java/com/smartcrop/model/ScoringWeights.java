package com.smartcrop.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Single-row table (id = 1) holding the admin-configurable factor weights. */
@Entity
@Table(name = "scoring_weights")
@Getter
@Setter
@NoArgsConstructor
public class ScoringWeights {

    @Id
    private Long id = 1L;

    private double soil = 25;
    private double season = 20;
    private double water = 20;
    private double ph = 10;
    private double rotation = 10;
    private double temperature = 10;
    private double rainfall = 5;
}
