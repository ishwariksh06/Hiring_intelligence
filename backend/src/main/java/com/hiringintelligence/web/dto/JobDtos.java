package com.hiringintelligence.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class JobDtos {

    private JobDtos() {}

    public record JobRequest(
            UUID companyId,
            @NotBlank String title,
            @NotBlank String description,
            List<String> requiredSkills,
            @NotNull @PositiveOrZero Integer minExperience,
            @NotNull @PositiveOrZero Integer maxExperience,
            String status
    ) {}

    public record JobResponse(
            UUID id,
            UUID companyId,
            String companyName,
            String title,
            String description,
            List<String> requiredSkills,
            int minExperience,
            int maxExperience,
            String status,
            Instant createdAt,
            long applicantCount,
            long shortlistedCount
    ) {}

    public record JobCandidateResponse(
            UUID matchId,
            UUID candidateId,
            String name,
            String email,
            int experienceYears,
            List<String> skills,
            int atsScore,
            int matchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            String explanation,
            String status
    ) {}

    public record SetStatusRequest(
            @NotBlank String status
    ) {}
}
