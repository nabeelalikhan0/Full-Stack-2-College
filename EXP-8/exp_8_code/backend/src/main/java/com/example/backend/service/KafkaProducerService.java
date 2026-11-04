package com.example.backend.service;

import com.example.backend.entity.ScheduledPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, ScheduledPost> kafkaTemplate;

    public void publishPostEvent(ScheduledPost post) {
        // Send event to Kafka topic
        kafkaTemplate.send("post-topic", String.valueOf(post.getId()), post);
        System.out.println("Published event for post ID: " + post.getId());
    }
}
