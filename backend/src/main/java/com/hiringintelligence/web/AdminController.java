package com.hiringintelligence.web;

import com.hiringintelligence.config.DataSeeder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DataSeeder dataSeeder;

    public AdminController(DataSeeder dataSeeder) {
        this.dataSeeder = dataSeeder;
    }

    /** Wipes every table and restores the seed dataset. Backs the Ingest screen's "Reset database". */
    @PostMapping("/reset")
    public Map<String, Long> reset() {
        dataSeeder.reseed();
        return dataSeeder.counts();
    }
}
