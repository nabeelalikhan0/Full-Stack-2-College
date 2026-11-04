package com.example.cicd.controller;

import com.example.cicd.model.CanaryConfig;
import com.example.cicd.model.CanaryMetrics;
import com.example.cicd.service.CanaryRoutingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/canary")
@CrossOrigin(origins = "*")
public class CanaryController {

    private final CanaryRoutingService routingService;

    public CanaryController(CanaryRoutingService routingService) {
        this.routingService = routingService;
    }

    @GetMapping("/config")
    public ResponseEntity<CanaryConfig> getConfig() {
        return ResponseEntity.ok(routingService.getConfig());
    }

    @PostMapping("/config")
    public ResponseEntity<CanaryConfig> updateConfig(@RequestBody Map<String, Object> body) {
        if (body.containsKey("canaryPercentage")) {
            int percentage = Integer.parseInt(body.get("canaryPercentage").toString());
            routingService.updateCanaryPercentage(percentage);
        }
        if (body.containsKey("enabled")) {
            boolean enabled = Boolean.parseBoolean(body.get("enabled").toString());
            routingService.setEnabled(enabled);
        }
        return ResponseEntity.ok(routingService.getConfig());
    }

    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> routeSingleRequest(
            @RequestHeader(value = "X-Canary-Force", required = false, defaultValue = "false") boolean forceCanary) {
        return ResponseEntity.ok(routingService.handleRoutedRequest(forceCanary));
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> routeBatchRequests(
            @RequestParam(defaultValue = "50") int count) {
        count = Math.max(1, Math.min(200, count)); // limit between 1 and 200
        List<Map<String, Object>> samples = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            Map<String, Object> res = routingService.handleRoutedRequest(false);
            if (i < 5) {
                // sample first few
                samples.add(res);
            }
        }

        CanaryMetrics metrics = routingService.getMetrics();
        Map<String, Object> batchResult = new HashMap<>();
        batchResult.put("batchSize", count);
        batchResult.put("currentConfiguredWeight", routingService.getConfig().getCanaryPercentage() + "%");
        batchResult.put("totalRequestsAllTime", metrics.getTotalRequests());
        batchResult.put("stableRequestsAllTime", metrics.getStableRequests());
        batchResult.put("canaryRequestsAllTime", metrics.getCanaryRequests());
        batchResult.put("actualCanaryPercentage", String.format("%.1f%%", metrics.getActualCanaryPercentage()));
        batchResult.put("samples", samples);

        return ResponseEntity.ok(batchResult);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        CanaryMetrics metrics = routingService.getMetrics();
        return ResponseEntity.ok(Map.of(
                "totalRequests", metrics.getTotalRequests(),
                "stableRequests", metrics.getStableRequests(),
                "canaryRequests", metrics.getCanaryRequests(),
                "actualCanaryPercentage", String.format("%.1f%%", metrics.getActualCanaryPercentage()),
                "lastRoutedTo", metrics.getLastRoutedTo(),
                "configuredPercentage", routingService.getConfig().getCanaryPercentage()
        ));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetMetrics() {
        routingService.resetMetrics();
        return ResponseEntity.ok(Map.of("message", "Canary routing metrics reset successfully"));
    }
}

