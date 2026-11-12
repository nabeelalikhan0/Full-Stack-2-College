package com.smartcrop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Background job: hourly refresh of aggregated statistics (clears the cache so they are recomputed). */
@Slf4j
@Component
@RequiredArgsConstructor
public class StatsRefreshJob {

    private final CacheManager cacheManager;

    @Scheduled(fixedRate = 3_600_000, initialDelay = 3_600_000)
    public void refreshStatistics() {
        Cache cache = cacheManager.getCache("stats");
        if (cache != null) {
            cache.clear();
            log.info("Statistics cache cleared; figures will be recomputed on next request");
        }
    }
}
