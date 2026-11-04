package com.example.cicd;

import com.example.cicd.model.Post;
import com.example.cicd.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

@SpringBootApplication
public class CicdDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CicdDemoApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(PostRepository postRepository) {
        return args -> {
            postRepository.save(new Post(
                    "Getting Started with CI/CD",
                    "Continuous Integration and Continuous Deployment automate tests and builds.",
                    "DevOps Lead",
                    "v1.0.0",
                    12,
                    LocalDateTime.now().minusHours(2)
            ));
            postRepository.save(new Post(
                    "Why Staged Canary Deployments Matter",
                    "Canary deployments roll out changes to a small subset of traffic to reduce production risk.",
                    "Cloud Architect",
                    "v1.0.0",
                    28,
                    LocalDateTime.now().minusHours(1)
            ));
        };
    }
}

