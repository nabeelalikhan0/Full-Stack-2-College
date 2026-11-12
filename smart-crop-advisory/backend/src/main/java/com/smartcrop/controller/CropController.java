package com.smartcrop.controller;

import com.smartcrop.model.Crop;
import com.smartcrop.service.CropService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
@RequiredArgsConstructor
public class CropController {

    private final CropService crops;

    @GetMapping
    public List<Crop> list() {
        return crops.findAll();
    }

    @GetMapping("/{id}")
    public Crop get(@PathVariable Long id) {
        return crops.get(id);
    }

    @PostMapping
    public ResponseEntity<Crop> create(@Valid @RequestBody Crop crop) {
        return ResponseEntity.status(HttpStatus.CREATED).body(crops.create(crop));
    }

    @PutMapping("/{id}")
    public Crop update(@PathVariable Long id, @Valid @RequestBody Crop crop) {
        return crops.update(id, crop);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        crops.delete(id);
        return ResponseEntity.noContent().build();
    }
}
