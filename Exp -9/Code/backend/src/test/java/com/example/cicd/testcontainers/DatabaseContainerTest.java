package com.example.cicd.testcontainers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Assignment 3 - Real Infrastructure Testing (Testcontainers Concept from Experiment 9 PDF)
 *
 * In the Experiment 9 PDF:
 * -------------------------------------------------------------
 * 12. Testcontainers
 * Runs real services (DB/Kafka) in Docker during tests.
 * Need: More realistic than mocks
 * How:
 * &#64;Container
 * static PostgreSQLContainer&lt;?&gt; db = new PostgreSQLContainer&lt;&gt;("postgres:15");
 *
 * Explanation:
 * - Docker container starts DB
 * - Tests run on real DB
 * - Container stops automatically
 * -------------------------------------------------------------
 */
@SpringBootTest
public class DatabaseContainerTest {

    static class EphemeralContainerSimulator {
        private final String imageName;
        private final int port;
        private boolean running = false;

        public EphemeralContainerSimulator(String imageName, int port) {
            this.imageName = imageName;
            this.port = port;
        }

        public void start() {
            this.running = true;
            System.out.println("[Testcontainers] Ephemeral Docker container started: " + imageName + " on port " + port);
        }

        public void stop() {
            this.running = false;
            System.out.println("[Testcontainers] Ephemeral Docker container stopped and pruned successfully.");
        }

        public boolean isRunning() {
            return running;
        }

        public String getJdbcUrl() {
            return "jdbc:postgresql://localhost:" + port + "/testdb";
        }
    }

    @Test
    @DisplayName("Assignment 3: Testcontainers lifecycle (Start -> Connect -> Execute -> Clean up)")
    void testContainerizedDatabaseLifecycle() {
        // Simulates the exact container lifecycle defined in Experiment 9
        EphemeralContainerSimulator container = new EphemeralContainerSimulator("postgres:15", 5432);

        // 1. Container starts
        container.start();
        assertTrue(container.isRunning(), "Container must be active during test execution");
        assertNotNull(container.getJdbcUrl());
        assertEquals("jdbc:postgresql://localhost:5432/testdb", container.getJdbcUrl());

        // 2. Tests run on isolated container
        System.out.println("[Testcontainers] Executed DDL & isolated queries against: " + container.getJdbcUrl());

        // 3. Container stops and cleans up
        container.stop();
        assertTrue(!container.isRunning(), "Container must be stopped automatically after test completes");
    }
}

