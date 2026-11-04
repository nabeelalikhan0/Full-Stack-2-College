package com.example.cicd.unit;

import com.example.cicd.model.CanaryConfig;
import com.example.cicd.model.CanaryMetrics;
import com.example.cicd.service.CanaryRoutingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Assignment 5 - Implement Canary Deployment (from Experiment 9 PDF)
 * Tests staged rollout logic, weight configuration, and request routing.
 */
public class CanaryDeploymentTest {

    private CanaryRoutingService routingService;

    @BeforeEach
    void setUp() {
        routingService = new CanaryRoutingService();
        routingService.resetMetrics();
    }

    @Test
    @DisplayName("Assignment 5: Default Canary percentage is initialized to 10% (as stated in PDF)")
    void testInitialCanaryPercentage() {
        CanaryConfig config = routingService.getConfig();
        assertEquals(10, config.getCanaryPercentage(), "Initial canary weight should be 10%");
        assertTrue(config.isEnabled(), "Canary routing should be active by default");
    }

    @Test
    @DisplayName("Assignment 5: Update Canary weight to 50% rollout")
    void testUpdateCanaryPercentage() {
        routingService.updateCanaryPercentage(50);
        assertEquals(50, routingService.getConfig().getCanaryPercentage());
    }

    @Test
    @DisplayName("Assignment 5: When Canary weight is 100%, all requests route to Canary")
    void testFullCanaryRollout() {
        routingService.updateCanaryPercentage(100);

        for (int i = 0; i < 20; i++) {
            Map<String, Object> response = routingService.handleRoutedRequest(false);
            assertEquals("Canary Instance (v2.0.0-canary)", response.get("servedBy"));
        }

        CanaryMetrics metrics = routingService.getMetrics();
        assertEquals(20, metrics.getTotalRequests());
        assertEquals(20, metrics.getCanaryRequests());
        assertEquals(0, metrics.getStableRequests());
        assertEquals(100.0, metrics.getActualCanaryPercentage());
    }

    @Test
    @DisplayName("Assignment 5: When Canary weight is 0%, all requests route to Stable")
    void testZeroCanaryRollout() {
        routingService.updateCanaryPercentage(0);

        for (int i = 0; i < 20; i++) {
            Map<String, Object> response = routingService.handleRoutedRequest(false);
            assertEquals("Stable Instance (v1.0.0)", response.get("servedBy"));
        }

        CanaryMetrics metrics = routingService.getMetrics();
        assertEquals(20, metrics.getTotalRequests());
        assertEquals(0, metrics.getCanaryRequests());
        assertEquals(20, metrics.getStableRequests());
        assertEquals(0.0, metrics.getActualCanaryPercentage());
    }

    @Test
    @DisplayName("Assignment 5: Header override routes directly to Canary for testing")
    void testHeaderForceCanary() {
        routingService.updateCanaryPercentage(0); // weight is 0%
        Map<String, Object> response = routingService.handleRoutedRequest(true); // header flag true

        assertEquals("Canary Instance (v2.0.0-canary)", response.get("servedBy"));
    }
}

