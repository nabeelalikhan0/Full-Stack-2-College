package com.example.cicd.model;

import java.util.concurrent.atomic.AtomicLong;

public class CanaryMetrics {
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong stableRequests = new AtomicLong(0);
    private final AtomicLong canaryRequests = new AtomicLong(0);
    private final AtomicLong failedRequests = new AtomicLong(0);
    private volatile String lastRoutedTo = "None";

    public long getTotalRequests() {
        return totalRequests.get();
    }

    public long getStableRequests() {
        return stableRequests.get();
    }

    public long getCanaryRequests() {
        return canaryRequests.get();
    }

    public long getFailedRequests() {
        return failedRequests.get();
    }

    public String getLastRoutedTo() {
        return lastRoutedTo;
    }

    public void recordStable() {
        totalRequests.incrementAndGet();
        stableRequests.incrementAndGet();
        this.lastRoutedTo = "Stable (v1.0.0)";
    }

    public void recordCanary() {
        totalRequests.incrementAndGet();
        canaryRequests.incrementAndGet();
        this.lastRoutedTo = "Canary (v2.0.0-canary)";
    }

    public void recordFailure() {
        failedRequests.incrementAndGet();
    }

    public double getActualCanaryPercentage() {
        long total = totalRequests.get();
        if (total == 0) return 0.0;
        return ((double) canaryRequests.get() / total) * 100.0;
    }

    public void reset() {
        totalRequests.set(0);
        stableRequests.set(0);
        canaryRequests.set(0);
        failedRequests.set(0);
        lastRoutedTo = "None";
    }
}

