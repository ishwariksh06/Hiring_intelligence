package com.hiringintelligence.web.dto;

import java.time.Instant;
import java.util.UUID;

public final class ReportDtos {

    private ReportDtos() {}

    public record GenerateReportRequest(String title) {}

    public record ReportResponse(
            UUID id,
            String title,
            Instant generatedAt,
            String reportUrl
    ) {}
}
