package com.hiringintelligence.screening;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pulls name, email, phone, years of experience, education and skills out of plain
 * resume text. Port of {@code parseResumeText} in the frontend. A real AI extraction
 * call can replace this later while keeping the {@link ParsedResume} contract.
 */
@Component
public class ResumeParser {

    private static final Pattern EMAIL = Pattern.compile("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE = Pattern.compile("\\+?\\d{2}[\\s-]?\\d{5}[\\s-]?\\d{5}");
    private static final Pattern YEARS = Pattern.compile(
            "(\\d{1,2}(?:\\.\\d)?)\\s*\\+?\\s*(?:years?|yrs?)\\s*(?:of\\s*)?(?:experience|exp)?",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern NAME_LINE = Pattern.compile("^[A-Za-z][A-Za-z.'-]+(?:\\s+[A-Za-z][A-Za-z.'-]+){1,3}$");

    private static final List<String> DEGREE_KEYWORDS = List.of(
            "B.Tech", "BTech", "B.E.", "BE ", "B.Sc", "BSc", "BCA", "B.Com",
            "M.Tech", "MTech", "M.E.", "M.Sc", "MSc", "MCA", "MBA", "PhD", "Ph.D");

    private final SkillDictionary skills;

    public ResumeParser(SkillDictionary skills) {
        this.skills = skills;
    }

    public ParsedResume parse(String rawText, String fileName, String fallbackName) {
        String text = rawText == null ? "" : rawText;
        String file = fileName == null || fileName.isBlank() ? "resume.txt" : fileName;

        Matcher em = EMAIL.matcher(text);
        String email = em.find() ? em.group().toLowerCase() : "";

        Matcher ph = PHONE.matcher(text);
        String phone = ph.find() ? ph.group().trim() : "";

        int experienceYears = 0;
        Matcher ye = YEARS.matcher(text);
        if (ye.find()) {
            experienceYears = Math.min(40, Math.round(Float.parseFloat(ye.group(1))));
        }

        List<String> found = skills.extractSkills(text);

        String fallback = fallbackName != null && !fallbackName.isBlank()
                ? fallbackName
                : file.replaceAll("(?i)\\.[a-z]+$", "").replaceAll("[_-]+", " ");
        String name = guessName(text, fallback);

        String summarySource = text.replaceAll("\\s+", " ").trim();
        String resumeSummary = summarySource.length() > 320
                ? summarySource.substring(0, 317) + "..."
                : summarySource;

        return new ParsedResume(name, email, phone, found, experienceYears,
                guessEducation(text), resumeSummary, text, file);
    }

    private String guessName(String text, String fallback) {
        for (String line : text.split("\\r?\\n")) {
            String l = line.trim();
            if (l.isEmpty()) {
                continue;
            }
            if (l.length() <= 40 && NAME_LINE.matcher(l).matches()) {
                return l;
            }
            return fallback;
        }
        return fallback;
    }

    private String guessEducation(String text) {
        String lower = text.toLowerCase();
        for (String kw : DEGREE_KEYWORDS) {
            int idx = lower.indexOf(kw.toLowerCase());
            if (idx != -1) {
                int end = Math.min(text.length(), idx + 90);
                String slice = text.substring(idx, end).split("\\r?\\n")[0].trim();
                return slice.replaceAll("[;,.]$", "");
            }
        }
        return "";
    }
}
