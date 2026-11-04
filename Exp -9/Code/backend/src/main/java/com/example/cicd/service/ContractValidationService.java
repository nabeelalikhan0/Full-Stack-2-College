package com.example.cicd.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service demonstrating Contract Testing concepts as specified in Experiment 9.
 * Validates consumer-producer schema agreement to prevent breaking API changes
 * (e.g., Frontend expecting "name" while Backend sends "username").
 */
@Service
public class ContractValidationService {

    // Consumer Contract definition (Frontend Expectations)
    private static final List<String> REQUIRED_FIELDS = List.of("id", "name", "email", "role");

    /**
     * Validates if a backend response adheres to the frontend consumer contract.
     */
    public Map<String, Object> validateContract(Map<String, Object> backendPayload) {
        Map<String, Object> result = new HashMap<>();
        List<String> missingFields = new ArrayList<>();
        List<String> unexpectedDiscrepancies = new ArrayList<>();

        for (String field : REQUIRED_FIELDS) {
            if (!backendPayload.containsKey(field) || backendPayload.get(field) == null) {
                missingFields.add(field);
            }
        }

        // Check the specific PDF scenario: "username" sent instead of "name"
        if (backendPayload.containsKey("username") && !backendPayload.containsKey("name")) {
            unexpectedDiscrepancies.add("Field mismatch: Consumer contract expects 'name', but provider supplied 'username'.");
        }

        boolean isValid = missingFields.isEmpty();

        result.put("contractStatus", isValid ? "PASSED" : "FAILED");
        result.put("expectedContractFields", REQUIRED_FIELDS);
        result.put("providedPayloadFields", backendPayload.keySet());
        result.put("missingRequiredFields", missingFields);
        result.put("discrepancies", unexpectedDiscrepancies);
        result.put("explanation", isValid
                ? "Contract verification successful! Frontend and backend contracts are synchronized."
                : "Contract validation failed! Breaking change detected before deployment.");

        return result;
    }

    /**
     * Returns a compliant sample payload (Passes contract).
     */
    public Map<String, Object> getCompliantPayload() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", 101);
        map.put("name", "Alice Johnson");
        map.put("email", "alice@example.com");
        map.put("role", "Developer");
        return map;
    }

    /**
     * Returns a breaking sample payload (Demonstrating the PDF issue: 'username' instead of 'name').
     */
    public Map<String, Object> getBreakingPayload() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", 102);
        map.put("username", "alice_dev"); // Breaking change!
        map.put("email", "alice@example.com");
        map.put("role", "Developer");
        return map;
    }
}

