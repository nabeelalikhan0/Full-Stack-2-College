package com.example.cicd.controller;

import com.example.cicd.model.Post;
import com.example.cicd.service.CalculatorService;
import com.example.cicd.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;
    private final CalculatorService calculatorService;

    public PostController(PostService postService, CalculatorService calculatorService) {
        this.postService = postService;
        this.calculatorService = calculatorService;
    }

    // Direct mapping for "/posts" as referenced in the Experiment 9 PDF (MockMvc example)
    @GetMapping({"/posts", "/api/posts"})
    public ResponseEntity<List<Post>> getPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @PostMapping({"/posts", "/api/posts"})
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        Post created = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping({"/posts/{id}", "/api/posts/{id}"})
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping({"/posts/{id}", "/api/posts/{id}"})
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long id) {
        boolean deleted = postService.deletePost(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully", "id", id.toString()));
        }
        return ResponseEntity.notFound().build();
    }

    // Versioned endpoint v1 (Stable Release)
    @GetMapping("/api/v1/posts")
    public ResponseEntity<Map<String, Object>> getPostsV1() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(Map.of(
                "version", "v1.0.0",
                "environment", "Stable Production",
                "count", posts.size(),
                "data", posts
        ));
    }

    // Versioned endpoint v2 (Canary Staged Release with enriched metadata)
    @GetMapping("/api/v2/posts")
    public ResponseEntity<Map<String, Object>> getPostsV2() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(Map.of(
                "version", "v2.0.0-canary",
                "environment", "Canary Deployment (Target 10-25% traffic)",
                "count", posts.size(),
                "features", List.of("Real-time sentiment", "AI Summaries", "High throughput cache"),
                "data", posts
        ));
    }

    // Calculator endpoint demonstrating integration with unit tested service
    @GetMapping("/api/calculator/add")
    public ResponseEntity<Map<String, Object>> calculateAdd(
            @RequestParam(defaultValue = "2") int a,
            @RequestParam(defaultValue = "3") int b) {
        int result = calculatorService.add(a, b);
        return ResponseEntity.ok(Map.of(
                "operation", "add",
                "a", a,
                "b", b,
                "result", result
        ));
    }
}

