package com.smartcrop.repository;

import com.smartcrop.model.RecommendationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<RecommendationRecord, Long> {

    List<RecommendationRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<RecommendationRecord> findTop10ByOrderByCreatedAtDesc();

    @Query("select r.topCrop, count(r) from RecommendationRecord r group by r.topCrop order by count(r) desc")
    List<Object[]> popularCrops();

    @Query("select r.state, count(r) from RecommendationRecord r group by r.state order by count(r) desc")
    List<Object[]> byState();
}
