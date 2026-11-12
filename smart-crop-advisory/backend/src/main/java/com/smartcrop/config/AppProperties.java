package com.smartcrop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Strongly-typed view of the "app.*" block in application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Admin admin, Pricing pricing) {

    public record Jwt(String secret, long expirationMs) {}

    public record Cors(List<String> allowedOrigins) {}

    public record Admin(String name, String email, String password) {}

    public record Pricing(double ureaPerKg, double dapPerKg, double mopPerKg,
                          double labourPerDay, double waterPerM3) {}
}
