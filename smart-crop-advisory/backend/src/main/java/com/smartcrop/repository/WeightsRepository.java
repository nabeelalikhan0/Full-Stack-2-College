package com.smartcrop.repository;

import com.smartcrop.model.ScoringWeights;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeightsRepository extends JpaRepository<ScoringWeights, Long> {
}
