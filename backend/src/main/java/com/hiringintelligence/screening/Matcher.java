package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Job;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Candidate &lt;-&gt; job matching. {@code matchScore = skillCoverage*70 + experienceFit*30}.
 * Port of {@code matchCandidateToJob} / {@code experienceFit}.
 */
@Component
public class Matcher {

    public record MatchResult(int matchScore, List<String> matchedSkills,
                              List<String> missingSkills, String explanation) {}

    public double experienceFit(int years, int min, int max) {
        int lo = Math.max(min, 0);
        int hi = max != 0 ? max : lo + 3;
        if (years >= lo && years <= hi) {
            return 1.0;
        }
        if (years < lo) {
            return Math.max(0, 1 - (double) (lo - years) / Math.max(lo, 2));
        }
        return Math.max(0, 1 - (double) (years - hi) / Math.max(hi, 3));
    }

    public MatchResult match(Candidate candidate, Job job) {
        List<String> required = job.getRequiredSkills() == null ? List.of() : job.getRequiredSkills();
        Set<String> candSkills = (candidate.getSkills() == null ? List.<String>of() : candidate.getSkills())
                .stream().map(s -> s.toLowerCase()).collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String s : required) {
            if (candSkills.contains(s.toLowerCase())) {
                matched.add(s);
            } else {
                missing.add(s);
            }
        }

        double coverage = required.isEmpty() ? 0 : (double) matched.size() / required.size();
        double fit = experienceFit(candidate.getExperienceYears(), job.getMinExperience(), job.getMaxExperience());

        int matchScore = (int) Math.round(coverage * 70 + fit * 30);
        String explanation = buildExplanation(candidate, job, matched, missing, fit);

        return new MatchResult(matchScore, matched, missing, explanation);
    }

    private String buildExplanation(Candidate c, Job job, List<String> matched, List<String> missing, double fit) {
        List<String> parts = new ArrayList<>();
        int reqCount = job.getRequiredSkills() == null ? 0 : job.getRequiredSkills().size();
        if (!matched.isEmpty()) {
            parts.add("Covers " + matched.size() + "/" + reqCount + " required skills ("
                    + String.join(", ", matched) + ").");
        } else {
            parts.add("None of the required skills were found on the resume.");
        }
        if (!missing.isEmpty()) {
            parts.add("Gaps: " + String.join(", ", missing) + ".");
        }
        int years = c.getExperienceYears();
        if (fit >= 0.99) {
            parts.add(years + " yrs experience sits inside the " + job.getMinExperience() + "-"
                    + job.getMaxExperience() + " yr window.");
        } else if (years < job.getMinExperience()) {
            parts.add(years + " yrs experience is below the " + job.getMinExperience() + " yr minimum.");
        } else {
            parts.add(years + " yrs experience is above the " + job.getMaxExperience() + " yr ceiling.");
        }
        return String.join(" ", parts);
    }
}
