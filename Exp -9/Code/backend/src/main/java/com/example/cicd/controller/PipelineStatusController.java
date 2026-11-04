package com.example.cicd.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pipeline")
@CrossOrigin(origins = "*")
public class PipelineStatusController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getPipelineStatus() {
        return ResponseEntity.ok(Map.of(
                "pipelineName", "Automated CI/CD Pipeline (Experiment 9)",
                "status", "HEALTHY",
                "currentBranch", "main",
                "commitHash", "9a7f3e1",
                "stages", List.of(
                        Map.of("id", "checkout", "name", "1. Code Checkout", "status", "SUCCESS", "duration", "2.1s"),
                        Map.of("id", "build", "name", "2. Maven Compilation (mvn clean install)", "status", "SUCCESS", "duration", "6.4s"),
                        Map.of("id", "unit_test", "name", "3. Unit Testing (JUnit 5)", "status", "SUCCESS", "duration", "3.2s"),
                        Map.of("id", "integration_test", "name", "4. Integration Testing (MockMvc)", "status", "SUCCESS", "duration", "4.8s"),
                        Map.of("id", "contract_test", "name", "5. Contract Testing (Pact / Schema)", "status", "SUCCESS", "duration", "2.5s"),
                        Map.of("id", "dockerize", "name", "6. Docker Containerization", "status", "SUCCESS", "duration", "14.1s"),
                        Map.of("id", "canary_deploy", "name", "7. Canary Deployment Rollout (10%)", "status", "ACTIVE", "duration", "Live")
                )
        ));
    }
}

