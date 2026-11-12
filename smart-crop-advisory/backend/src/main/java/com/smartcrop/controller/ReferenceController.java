package com.smartcrop.controller;

import com.smartcrop.service.ReferenceDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceController {

    private final ReferenceDataService reference;

    /** Soils, irrigation methods, regions, seasons and water levels used by the wizard. */
    @GetMapping
    public Map<String, Object> all() {
        return reference.all();
    }
}
