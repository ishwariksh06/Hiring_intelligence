package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Scores how machine-readable / complete a parsed resume is (0-100). A gate on
 * data quality, not candidate quality. Port of {@code atsCheck}.
 */
@Component
public class AtsChecker {

    public record AtsResult(int atsScore, List<String> atsFlags, boolean atsPassed) {}

    private record Check(boolean ok, int weight, String flag) {}

    public AtsResult check(Candidate c) {
        List<Check> checks = List.of(
                new Check(notBlank(c.getEmail()), 20, "No email address found"),
                new Check(notBlank(c.getPhone()), 10, "No phone number found"),
                new Check(size(c.getSkills()) >= 3, 30, "Fewer than 3 recognised skills"),
                new Check(c.getExperienceYears() > 0, 20, "Years of experience not stated"),
                new Check(notBlank(c.getEducation()), 10, "No education section detected"),
                new Check(len(c.getRawText()) >= 200, 10, "Resume text unusually short")
        );

        int score = 0;
        List<String> flags = new ArrayList<>();
        for (Check ch : checks) {
            if (ch.ok()) {
                score += ch.weight();
            } else {
                flags.add(ch.flag());
            }
        }
        return new AtsResult(score, flags, score >= 60);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static int size(List<?> list) {
        return list == null ? 0 : list.size();
    }

    private static int len(String s) {
        return s == null ? 0 : s.length();
    }
}
