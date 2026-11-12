package com.smartcrop.service;

import com.smartcrop.dto.AdminDtos.AdminStats;
import com.smartcrop.dto.AdminDtos.NameCount;
import com.smartcrop.dto.AdminDtos.RecentItem;
import com.smartcrop.repository.CropRepository;
import com.smartcrop.repository.RecommendationRepository;
import com.smartcrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository users;
    private final CropRepository crops;
    private final RecommendationRepository recommendations;

    /** Cached; evicted whenever a user registers or a recommendation is created, and hourly by StatsRefreshJob. */
    @Cacheable("stats")
    public AdminStats stats() {
        List<NameCount> popular = recommendations.popularCrops().stream()
                .limit(8)
                .map(row -> new NameCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();
        List<NameCount> byState = recommendations.byState().stream()
                .limit(10)
                .map(row -> new NameCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();
        List<RecentItem> recent = recommendations.findTop10ByOrderByCreatedAtDesc().stream()
                .map(r -> new RecentItem(r.getId(), r.getUser().getEmail(), r.getState(),
                        r.getTopCrop(), r.getTopScore(), r.getCreatedAt()))
                .toList();
        return new AdminStats(users.count(), recommendations.count(), crops.count(), popular, byState, recent);
    }
}
