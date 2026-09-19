package com.hiringintelligence.web;

import com.hiringintelligence.service.ReadCache;
import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.service.AnalyticsService;
import com.hiringintelligence.web.dto.AnalyticsDtos.DashboardSummary;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AnalyticsService analyticsService;
    private final ReadCache cache;

    public DashboardController(AnalyticsService analyticsService, ReadCache cache) {
        this.analyticsService = analyticsService;
        this.cache = cache;
    }

    @GetMapping("/summary")
    public DashboardSummary summary(@AuthenticationPrincipal AppPrincipal principal) {
        return cache.get(ReadCache.key("dashboard", principal), () -> analyticsService.dashboardSummary(principal));
    }
}
