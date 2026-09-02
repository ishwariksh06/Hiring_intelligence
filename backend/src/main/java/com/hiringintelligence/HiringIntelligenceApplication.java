package com.hiringintelligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

// JWT auth is handled by our own filter + AuthService; no UserDetailsService needed.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class HiringIntelligenceApplication {
    public static void main(String[] args) {
        SpringApplication.run(HiringIntelligenceApplication.class, args);
    }
}
