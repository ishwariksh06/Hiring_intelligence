package com.hiringintelligence.web.dto;

import java.util.List;
import java.util.UUID;

public final class AnalyticsDtos {

    private AnalyticsDtos() {}

    public record SkillCount(String skill, long count) {}

    public record FunnelStage(String stage, long count) {}

    public record SkillGapRow(String skill, long required, long available) {}

    public record TrendPoint(String month, long ingested, long shortlisted) {}

    public record RecentJob(
            UUID id,
            String title,
            String companyName,
            List<String> requiredSkills,
            int minExperience,
            int maxExperience,
            long shortlistedCount
    ) {}

    public record DashboardSummary(
            long openJobs,
            long candidatesScreened,
            long shortlisted,
            int avgMatchScore,
            Long companies,
            List<RecentJob> recentJobs
    ) {}
}
