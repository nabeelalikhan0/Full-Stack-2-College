package com.example.cicd.controller;

import com.example.cicd.service.ContractValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contract")
@CrossOrigin(origins = "*")
public class ContractVerificationController {

    private final ContractValidationService contractService;

    public ContractVerificationController(ContractValidationService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyContract(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(contractService.validateContract(payload));
    }

    @GetMapping("/sample/compliant")
    public ResponseEntity<Map<String, Object>> getCompliantSample() {
        return ResponseEntity.ok(contractService.getCompliantPayload());
    }

    @GetMapping("/sample/breaking")
    public ResponseEntity<Map<String, Object>> getBreakingSample() {
        return ResponseEntity.ok(contractService.getBreakingPayload());
    }
}

