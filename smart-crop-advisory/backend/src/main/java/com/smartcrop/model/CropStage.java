package com.smartcrop.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One growth stage of a crop. waterFraction is the share of the crop's seasonal water need. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CropStage {
    private String name;
    private int days;
    private double waterFraction;
    private boolean critical;
}
