package com.hiringintelligence.web.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public final class CompanyDtos {

    private CompanyDtos() {}

    public record CreateCompanyRequest(
            @NotBlank String name,
            String industry,
            String location,
            String contactName,
            String contactEmail
    ) {}

    public record CompanyResponse(
            UUID id,
            String name,
            String industry,
            String location,
            String contactName,
            String contactEmail,
            Instant createdAt,
            long openJobs,
            long totalJobs,
            long shortlistedCandidates,
            String recruiterEmail
    ) {}
}
