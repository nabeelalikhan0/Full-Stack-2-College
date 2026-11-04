package com.example.backend.service;

import com.example.backend.entity.ProcessedEvent;
import com.example.backend.entity.ScheduledPost;
import com.example.backend.repository.ProcessedEventRepository;
import com.example.backend.repository.ScheduledPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class KafkaConsumerService {

    @Autowired
    private ScheduledPostRepository postRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private KafkaTemplate<String, ScheduledPost> kafkaTemplate;

    // The retry configuration is typically done using @Retryable or in Kafka listener container factory.
    // For simplicity, we can implement basic retry and DLQ logic here or rely on Spring Kafka's error handler.
    // Here we implement idempotency and a simulated processing.

    @KafkaListener(topics = "post-topic", groupId = "post-processing-group")
    public void consumePostEvent(ScheduledPost post) {
        String eventId = String.valueOf(post.getId());

        // 1. Idempotency Check
        if (processedEventRepository.existsById(eventId)) {
            System.out.println("Duplicate event detected. Skipping post ID: " + eventId);
            return;
        }

        try {
            // Simulate processing (e.g., calling an external API)
            System.out.println("Processing post ID: " + eventId);
            
            // Simulate random failure for retry demonstration
            if (Math.random() < 0.2) {
                throw new RuntimeException("Simulated transient failure");
            }

            post.setStatus("PUBLISHED");
            postRepository.save(post);

            // 2. Mark as processed for Idempotency
            ProcessedEvent processedEvent = new ProcessedEvent();
            processedEvent.setEventId(eventId);
            processedEvent.setProcessedAt(LocalDateTime.now());
            processedEventRepository.save(processedEvent);

            System.out.println("Successfully published post ID: " + eventId);

        } catch (Exception e) {
            System.err.println("Error processing post ID: " + eventId + ". " + e.getMessage());
            // 3. Send to DLQ (Dead Letter Queue) upon failure (after retries in a real scenario)
            // Here we send it directly to DLQ for demonstration if processing fails
            sendToDlq(post);
        }
    }

    private void sendToDlq(ScheduledPost post) {
        kafkaTemplate.send("post-topic-dlq", String.valueOf(post.getId()), post);
        System.out.println("Sent post ID: " + post.getId() + " to DLQ");
        post.setStatus("FAILED");
        postRepository.save(post);
    }
}
