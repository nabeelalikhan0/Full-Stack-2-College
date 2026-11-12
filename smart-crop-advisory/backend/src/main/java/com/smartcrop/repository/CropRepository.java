package com.smartcrop.repository;

import com.smartcrop.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Long> {
    Optional<Crop> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
