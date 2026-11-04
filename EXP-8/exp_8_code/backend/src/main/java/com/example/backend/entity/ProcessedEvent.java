package com.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class ProcessedEvent {
    @Id
    private String eventId;
    private LocalDateTime processedAt;
}
