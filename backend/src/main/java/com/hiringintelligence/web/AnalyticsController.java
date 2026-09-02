package com.hiringintelligence.web;

import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.service.AnalyticsService;
import com.hiringintelligence.web.dto.AnalyticsDtos.FunnelStage;
import com.hiringintelligence.web.dto.AnalyticsDtos.SkillCount;
import com.hiringintelligence.web.dto.AnalyticsDtos.SkillGapRow;
import com.hiringintelligence.web.dto.AnalyticsDtos.TrendPoint;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/skills")
    public List<SkillCount> skills(@AuthenticationPrincipal AppPrincipal principal) {
        return analyticsService.skillDemand(principal);
    }

    @GetMapping("/funnel")
    public List<FunnelStage> funnel(@AuthenticationPrincipal AppPrincipal principal) {
        return analyticsService.screeningFunnel(principal);
    }

    @GetMapping("/skill-gap")
    public List<SkillGapRow> skillGap(@AuthenticationPrincipal AppPrincipal principal) {
        return analyticsService.skillGap(principal);
    }

    @GetMapping("/trend")
    public List<TrendPoint> trend(@AuthenticationPrincipal AppPrincipal principal) {
        return analyticsService.ingestTrend(principal);
    }
}
