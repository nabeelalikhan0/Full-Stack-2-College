package com.example.cicd.model;

public class CanaryConfig {
    private int canaryPercentage; // e.g. 10 for 10%
    private boolean enabled;
    private String stableVersion;
    private String canaryVersion;

    public CanaryConfig() {
        this.canaryPercentage = 10;
        this.enabled = true;
        this.stableVersion = "v1.0.0";
        this.canaryVersion = "v2.0.0-canary";
    }

    public CanaryConfig(int canaryPercentage, boolean enabled, String stableVersion, String canaryVersion) {
        this.canaryPercentage = canaryPercentage;
        this.enabled = enabled;
        this.stableVersion = stableVersion;
        this.canaryVersion = canaryVersion;
    }

    public int getCanaryPercentage() {
        return canaryPercentage;
    }

    public void setCanaryPercentage(int canaryPercentage) {
        this.canaryPercentage = Math.max(0, Math.min(100, canaryPercentage));
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getStableVersion() {
        return stableVersion;
    }

    public void setStableVersion(String stableVersion) {
        this.stableVersion = stableVersion;
    }

    public String getCanaryVersion() {
        return canaryVersion;
    }

    public void setCanaryVersion(String canaryVersion) {
        this.canaryVersion = canaryVersion;
    }
}

