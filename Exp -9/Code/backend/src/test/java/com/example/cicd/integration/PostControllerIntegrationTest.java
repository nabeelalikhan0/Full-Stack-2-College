package com.example.cicd.integration;

import com.example.cicd.model.Post;
import com.example.cicd.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Assignment 2 - API Integration Testing with MockMvc (as specified in Experiment 9 PDF)
 * Tests APIs by simulating HTTP requests and validating response status and body.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class PostControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setupData() {
        if (postRepository.count() == 0) {
            postRepository.save(new Post(
                    "Sample CI/CD Post",
                    "Automated integration testing ensures microservices function properly.",
                    "DevOps Engineer",
                    "v1.0.0",
                    5,
                    LocalDateTime.now()
            ));
        }
    }

    @Test
    @DisplayName("Assignment 2: GET /posts returns HTTP 200 OK (from Experiment 9 PDF)")
    void testGetPosts() throws Exception {
        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("API Test: POST /posts creates a new resource and returns HTTP 201 Created")
    void testCreatePost() throws Exception {
        Post newPost = new Post(
                "Automated Pipeline Deployment",
                "Testing pipeline automation with GitHub Actions and Docker containers.",
                "QA Engineer",
                "v1.0.0",
                10,
                LocalDateTime.now()
        );

        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPost)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Automated Pipeline Deployment")))
                .andExpect(jsonPath("$.author", is("QA Engineer")));
    }

    @Test
    @DisplayName("API Test: GET /api/v1/posts returns stable production metadata")
    void testGetPostsV1() throws Exception {
        mockMvc.perform(get("/api/v1/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version", is("v1.0.0")))
                .andExpect(jsonPath("$.environment", is("Stable Production")));
    }

    @Test
    @DisplayName("API Test: GET /api/v2/posts returns Canary staged rollout metadata")
    void testGetPostsV2() throws Exception {
        mockMvc.perform(get("/api/v2/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version", is("v2.0.0-canary")))
                .andExpect(jsonPath("$.environment", is("Canary Deployment (Target 10-25% traffic)")));
    }
}

