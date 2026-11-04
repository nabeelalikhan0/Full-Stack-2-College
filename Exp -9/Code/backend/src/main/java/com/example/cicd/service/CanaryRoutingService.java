package com.example.cicd.service;

import com.example.cicd.model.CanaryConfig;
import com.example.cicd.model.CanaryMetrics;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class CanaryRoutingService {

    private final CanaryConfig config = new CanaryConfig();
    private final CanaryMetrics metrics = new CanaryMetrics();
    private final Random random = new Random();

    public CanaryConfig getConfig() {
        return config;
    }

    public void updateCanaryPercentage(int percentage) {
        config.setCanaryPercentage(percentage);
    }

    public void setEnabled(boolean enabled) {
        config.setEnabled(enabled);
    }

    public CanaryMetrics getMetrics() {
        return metrics;
    }

    public void resetMetrics() {
        metrics.reset();
    }

    /**
     * Determines whether an incoming request should route to Canary or Stable.
     * Evaluates Canary percentage or header override.
     */
    public boolean shouldRouteToCanary(boolean headerForceCanary) {
        if (headerForceCanary) {
            return true;
        }
        if (!config.isEnabled() || config.getCanaryPercentage() <= 0) {
            return false;
        }
        if (config.getCanaryPercentage() >= 100) {
            return true;
        }
        // Traffic split based on configured percentage
        int roll = random.nextInt(100);
        return roll < config.getCanaryPercentage();
    }

    /**
     * Processes a routed request and records metrics.
     */
    public Map<String, Object> handleRoutedRequest(boolean headerForceCanary) {
        boolean isCanary = shouldRouteToCanary(headerForceCanary);
        Map<String, Object> response = new HashMap<>();

        if (isCanary) {
            metrics.recordCanary();
            response.put("servedBy", "Canary Instance (v2.0.0-canary)");
            response.put("version", config.getCanaryVersion());
            response.put("featureFlag", "ENHANCED_ANALYTICS_ENABLED");
            response.put("message", "Request handled by Canary deployment (new build rollout)");
            response.put("canaryWeightConfigured", config.getCanaryPercentage() + "%");
        } else {
            metrics.recordStable();
            response.put("servedBy", "Stable Instance (v1.0.0)");
            response.put("version", config.getStableVersion());
            response.put("featureFlag", "LEGACY_MODE");
            response.put("message", "Request handled by Stable production release");
            response.put("canaryWeightConfigured", config.getCanaryPercentage() + "%");
        }

        response.put("timestamp", System.currentTimeMillis());
        response.put("metricsSummary", Map.of(
                "total", metrics.getTotalRequests(),
                "stableCount", metrics.getStableRequests(),
                "canaryCount", metrics.getCanaryRequests(),
                "actualCanaryPercentage", String.format("%.1f%%", metrics.getActualCanaryPercentage())
        ));

        return response;
    }
}
