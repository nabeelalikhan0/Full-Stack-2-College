package com.example.backend.service;

import com.example.backend.entity.ScheduledPost;
import com.example.backend.repository.ScheduledPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostSchedulerService {

    @Autowired
    private ScheduledPostRepository repository;

    @Autowired
    private KafkaProducerService producerService;

    // Run every 10 seconds
    @Scheduled(fixedRate = 10000)
    public void checkAndPublishDuePosts() {
        LocalDateTime now = LocalDateTime.now();
        List<ScheduledPost> duePosts = repository.findByStatusAndScheduledTimeBefore("PENDING", now);

        for (ScheduledPost post : duePosts) {
            producerService.publishPostEvent(post);
            post.setStatus("PUBLISHING");
            repository.save(post);
        }
    }
}
