package com.example.cicd.contract;

import com.example.cicd.service.ContractValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Contract Testing (Pact / Schema Validation) as specified in Experiment 9 PDF.
 * Ensures frontend consumer expectations and backend provider payloads remain synchronized.
 * Catches breaking schema changes (e.g. backend changing "name" to "username").
 */
public class ApiContractTest {

    private ContractValidationService contractService;

    @BeforeEach
    void setUp() {
        contractService = new ContractValidationService();
    }

    @Test
    @DisplayName("Contract Test PASS: Backend payload contains all required consumer fields")
    void testCompliantContractPasses() {
        Map<String, Object> compliantPayload = contractService.getCompliantPayload();

        Map<String, Object> validation = contractService.validateContract(compliantPayload);

        assertEquals("PASSED", validation.get("contractStatus"));
        List<?> missing = (List<?>) validation.get("missingRequiredFields");
        assertTrue(missing.isEmpty(), "No required fields should be missing in a compliant payload");
    }

    @Test
    @DisplayName("Contract Test FAIL: Backend changes 'name' to 'username' (Direct PDF scenario)")
    void testBreakingContractFails() {
        // As defined in Experiment 9 PDF:
        // Frontend expects: { "name": "XYZ" }
        // Backend sends:    { "username": "XYZ" }
        Map<String, Object> breakingPayload = contractService.getBreakingPayload();

        Map<String, Object> validation = contractService.validateContract(breakingPayload);

        assertEquals("FAILED", validation.get("contractStatus"));

        @SuppressWarnings("unchecked")
        List<String> missing = (List<String>) validation.get("missingRequiredFields");
        assertTrue(missing.contains("name"), "Contract test must flag 'name' as missing");

        @SuppressWarnings("unchecked")
        List<String> discrepancies = (List<String>) validation.get("discrepancies");
        assertFalse(discrepancies.isEmpty(), "Discrepancy must explain 'username' mismatch");
    }
}

