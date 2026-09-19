package com.hiringintelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.screening.AtsChecker;
import com.hiringintelligence.screening.ParsedResume;
import com.hiringintelligence.screening.ResumeParser;
import com.hiringintelligence.screening.ScreeningService;
import com.hiringintelligence.web.ApiExceptions;
import com.hiringintelligence.web.dto.CandidateDtos.IngestJsonEntry;
import com.hiringintelligence.web.dto.CandidateDtos.IngestedCandidateResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class IngestionService {

    private static final java.util.regex.Pattern ALLOWED_FILE_TYPE =
            java.util.regex.Pattern.compile(".*\\.(pdf|docx|txt|md|csv|json)$", java.util.regex.Pattern.CASE_INSENSITIVE);

    private final CandidateRepository candidates;
    private final ResumeParser parser;
    private final AtsChecker ats;
    private final ScreeningService screening;
    private final ObjectMapper objectMapper;

    public IngestionService(CandidateRepository candidates, ResumeParser parser, AtsChecker ats,
                            ScreeningService screening, ObjectMapper objectMapper) {
        this.candidates = candidates;
        this.parser = parser;
        this.ats = ats;
        this.screening = screening;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public List<IngestedCandidateResponse> ingestJson(List<IngestJsonEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            throw new ApiExceptions.BadRequestException("No resume entries supplied");
        }
        return persistAndRescore(entries);
    }

    @Transactional
    public List<IngestedCandidateResponse> ingestFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new ApiExceptions.BadRequestException("No files supplied");
        }
        List<IngestJsonEntry> entries = new ArrayList<>();
        int index = 0;
        for (MultipartFile file : files) {
            String name = file.getOriginalFilename() == null ? "upload_" + index + ".txt" : file.getOriginalFilename();
            if (!ALLOWED_FILE_TYPE.matcher(name).matches()) {
                throw new ApiExceptions.BadRequestException(
                        "Unsupported file type: " + name + ". Allowed: PDF, DOCX, TXT, MD, CSV, JSON.");
            }
            if (file.isEmpty()) {
                throw new ApiExceptions.BadRequestException("File is empty: " + name);
            }
            boolean textLike = name.toLowerCase().matches(".*\\.(txt|csv|json|md)$")
                    || (file.getContentType() != null && file.getContentType().startsWith("text/"));
            String raw = "";
            if (textLike) {
                try {
                    raw = new String(file.getBytes(), StandardCharsets.UTF_8);
                } catch (Exception e) {
                    raw = "";
                }
            }

            if (name.toLowerCase().endsWith(".json") && raw.trim().startsWith("[")) {
                try {
                    IngestJsonEntry[] parsed = objectMapper.readValue(raw, IngestJsonEntry[].class);
                    for (IngestJsonEntry entry : parsed) {
                        entries.add(withSourceFile(entry, name));
                    }
                    index++;
                    continue;
                } catch (Exception ignored) {
                    // fall through to single-record handling
                }
            }

            String text = !raw.isBlank() ? raw
                    : name.replaceAll("(?i)\\.[a-z]+$", "").replaceAll("[_-]+", " ")
                    + "\n(Resume text could not be extracted from this file.)";
            entries.add(new IngestJsonEntry(text, null, null, null, null, null, null, null, name, null));
            index++;
        }
        return persistAndRescore(entries);
    }

    private List<IngestedCandidateResponse> persistAndRescore(List<IngestJsonEntry> entries) {
        List<Candidate> prepared = new ArrayList<>(entries.size());
        int i = 0;
        for (IngestJsonEntry entry : entries) {
            String sourceFile = entry.sourceFile() != null ? entry.sourceFile() : "upload_" + i + ".txt";
            ParsedResume parsed = entry.rawText() != null
                    ? parser.parse(entry.rawText(), sourceFile, entry.name())
                    : null;

            Candidate c = new Candidate();
            c.setName(firstNonBlank(entry.name(), parsed != null ? parsed.name() : null, "Candidate " + (i + 1)));
            c.setEmail(coalesce(entry.email(), parsed != null ? parsed.email() : null, ""));
            c.setPhone(coalesce(entry.phone(), parsed != null ? parsed.phone() : null, ""));
            c.setSkills(new ArrayList<>(nonNull(entry.skills(), parsed != null ? parsed.skills() : null)));
            c.setExperienceYears(coalesceInt(entry.experienceYears(), parsed != null ? parsed.experienceYears() : null));
            c.setEducation(coalesce(entry.education(), parsed != null ? parsed.education() : null, ""));
            c.setResumeSummary(coalesce(entry.resumeSummary(), parsed != null ? parsed.resumeSummary() : null, ""));
            c.setRawText(coalesce(entry.rawText(), parsed != null ? parsed.rawText() : null, ""));
            c.setSourceFile(sourceFile);
            c.setCategory(entry.category() != null && !entry.category().isBlank() ? entry.category() : "Uncategorised");

            AtsChecker.AtsResult result = ats.check(c);
            c.setAtsScore(result.atsScore());
            c.setAtsFlags(new ArrayList<>(result.atsFlags()));

            prepared.add(c);
            i++;
        }

        List<Candidate> saved = candidates.saveAll(prepared);
        screening.rescoreAllOpenJobs();

        return saved.stream().map(c -> new IngestedCandidateResponse(
                c.getId(), c.getName(), c.getSkills(), c.getExperienceYears(),
                c.getEducation(), c.getAtsScore(), c.getAtsFlags(), c.getSourceFile()
        )).toList();
    }

    private static IngestJsonEntry withSourceFile(IngestJsonEntry e, String sourceFile) {
        return new IngestJsonEntry(e.rawText(), e.name(), e.email(), e.phone(), e.skills(),
                e.experienceYears(), e.education(), e.resumeSummary(), sourceFile, e.category());
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    private static String coalesce(String a, String b, String fallback) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return fallback;
    }

    private static int coalesceInt(Integer a, Integer b) {
        if (a != null) {
            return a;
        }
        return b != null ? b : 0;
    }

    private static List<String> nonNull(List<String> a, List<String> b) {
        if (a != null) {
            return a;
        }
        return b != null ? b : List.of();
    }
}
