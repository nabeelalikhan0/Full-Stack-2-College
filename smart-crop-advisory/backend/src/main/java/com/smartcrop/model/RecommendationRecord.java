package com.smartcrop.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Saved recommendation run: summary columns for queries + full input/result JSON for replay. */
@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor
public class RecommendationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private Instant createdAt = Instant.now();

    private String state;
    private String district;
    private String soilType;
    private String season;
    private String previousCrop;
    private double landAreaHa;

    private String topCrop;
    private double topScore;

    @Column(columnDefinition = "TEXT")
    private String inputJson;

    @Column(columnDefinition = "TEXT")
    private String resultJson;
}
