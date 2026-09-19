package com.hiringintelligence.web;

import com.hiringintelligence.service.ReadCache;
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
    private final ReadCache cache;

    public AdminController(DataSeeder dataSeeder, ReadCache cache) {
        this.dataSeeder = dataSeeder;
        this.cache = cache;
    }

    /** Wipes every table and restores the seed dataset. Backs the Ingest screen's "Reset database". */
    @PostMapping("/reset")
    public Map<String, Long> reset() {
        dataSeeder.reseed();
        cache.clear();
        return dataSeeder.counts();
    }
}
