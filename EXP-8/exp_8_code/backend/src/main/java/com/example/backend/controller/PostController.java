package com.example.backend.controller;

import com.example.backend.entity.ScheduledPost;
import com.example.backend.repository.ScheduledPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*") // For development, allow all origins
public class PostController {

    @Autowired
    private ScheduledPostRepository repository;

    @PostMapping("/schedule")
    public ResponseEntity<ScheduledPost> schedulePost(@RequestBody ScheduledPost post) {
        post.setStatus("PENDING");
        ScheduledPost savedPost = repository.save(post);
        return ResponseEntity.ok(savedPost);
    }

    @GetMapping
    public ResponseEntity<List<ScheduledPost>> getAllPosts() {
        return ResponseEntity.ok(repository.findAll());
    }
}
