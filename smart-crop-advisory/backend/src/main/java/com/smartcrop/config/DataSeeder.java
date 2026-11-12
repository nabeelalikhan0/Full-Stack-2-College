package com.smartcrop.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcrop.model.AppUser;
import com.smartcrop.model.Crop;
import com.smartcrop.model.Role;
import com.smartcrop.repository.CropRepository;
import com.smartcrop.repository.UserRepository;
import com.smartcrop.service.CropService;
import com.smartcrop.service.WeightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

/** Loads the crop dataset, default scoring weights and the admin account on first start. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CropRepository crops;
    private final UserRepository users;
    private final WeightsService weights;
    private final PasswordEncoder encoder;
    private final ObjectMapper mapper;
    private final AppProperties props;

    @Override
    public void run(String... args) throws Exception {
        seedCrops();
        weights.get();
        seedAdmin();
    }

    private void seedCrops() throws Exception {
        try (InputStream in = new ClassPathResource("data/crops.json").getInputStream()) {
            List<Crop> list = mapper.readValue(in, new TypeReference<List<Crop>>() {});
            int added = 0;
            for (Crop c : list) {
                if (crops.existsByNameIgnoreCase(c.getName())) {
                    continue;
                }
                if (c.getStages() == null || c.getStages().isEmpty()) {
                    c.setStages(CropService.defaultStages(c.getDurationDays()));
                }
                crops.save(c);
                added++;
            }
            if (added > 0) {
                log.info("Seeded {} crops", added);
            }
        }
    }

    private void seedAdmin() {
        String email = props.admin().email().toLowerCase();
        if (users.existsByEmail(email)) {
            return;
        }
        AppUser admin = new AppUser();
        admin.setName(props.admin().name());
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(props.admin().password()));
        admin.setRole(Role.ADMIN);
        users.save(admin);
        log.info("Created default admin account: {}", email);
    }
}
