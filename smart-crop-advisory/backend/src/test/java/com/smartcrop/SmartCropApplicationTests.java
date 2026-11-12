package com.smartcrop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1")
class SmartCropApplicationTests {

    @Test
    void contextLoads() {
        // Boots the full application against in-memory H2 and runs the data seeder.
    }
}
