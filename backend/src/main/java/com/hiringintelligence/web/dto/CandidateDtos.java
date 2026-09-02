package com.hiringintelligence.web.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class CandidateDtos {

    private CandidateDtos() {}

    public record CandidatePoolResponse(
            UUID id,
            String name,
            String email,
            String phone,
            List<String> skills,
            int experienceYears,
            String education,
            String resumeSummary,
            String sourceFile,
            String category,
            int atsScore,
            List<String> atsFlags,
            Instant createdAt,
            int matchCount,
            Integer bestMatchScore
    ) {}

    public record CandidateMatchView(
            UUID id,
            UUID jobId,
            UUID candidateId,
            int matchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            String explanation,
            Integer rank,
            String status,
            boolean statusLocked,
            Instant createdAt,
            String jobTitle,
            String companyName
    ) {}

    public record CandidateDetailResponse(
            UUID id,
            String name,
            String email,
            String phone,
            List<String> skills,
            int experienceYears,
            String education,
            String resumeSummary,
            String rawText,
            String sourceFile,
            String category,
            int atsScore,
            List<String> atsFlags,
            Instant createdAt,
            List<CandidateMatchView> matches,
            List<String> interviewQuestions
    ) {}

    /** JSON ingestion entry: an already-parsed candidate or a raw resume blob. */
    public record IngestJsonEntry(
            String rawText,
            String name,
            String email,
            String phone,
            List<String> skills,
            Integer experienceYears,
            String education,
            String resumeSummary,
            String sourceFile,
            String category
    ) {}

    public record IngestedCandidateResponse(
            UUID id,
            String name,
            List<String> skills,
            int experienceYears,
            String education,
            int atsScore,
            List<String> atsFlags,
            String sourceFile
    ) {}
}
