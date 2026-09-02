package com.hiringintelligence.screening;

import java.util.List;

/** Structured output of {@link ResumeParser}. Same contract as the frontend parser. */
public record ParsedResume(
        String name,
        String email,
        String phone,
        List<String> skills,
        int experienceYears,
        String education,
        String resumeSummary,
        String rawText,
        String sourceFile
) {}
