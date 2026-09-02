package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Job;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ScreeningLogicTest {

    private final SkillDictionary dictionary = new SkillDictionary();
    private final Matcher matcher = new Matcher();
    private final AtsChecker ats = new AtsChecker();

    @Test
    void extractsCanonicalSkillsLongestAliasFirst() {
        // Comma-separated skill line, the shape resumes actually use.
        List<String> skills = dictionary.extractSkills("SKILLS\nSpring Boot, Java 17, PostgreSQL, Docker, React");
        assertThat(skills).contains("Spring Boot", "Java", "PostgreSQL", "Docker", "React");
        // a bare "spring" alias must not shadow the longer "spring boot" match
        assertThat(skills).doesNotContain("Spring");
    }

    @Test
    void experienceFitIsOneInsideWindowAndDecaysOutside() {
        assertThat(matcher.experienceFit(5, 4, 8)).isEqualTo(1.0);
        assertThat(matcher.experienceFit(2, 4, 8)).isLessThan(1.0).isGreaterThanOrEqualTo(0.0);
        assertThat(matcher.experienceFit(20, 4, 8)).isLessThan(1.0).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    void matchScoreRewardsSkillCoverageAndExperience() {
        Candidate c = new Candidate();
        c.setSkills(List.of("Java", "Spring Boot", "PostgreSQL"));
        c.setExperienceYears(5);

        Job job = new Job();
        job.setRequiredSkills(List.of("Java", "Spring Boot", "PostgreSQL", "Kafka"));
        job.setMinExperience(4);
        job.setMaxExperience(8);

        Matcher.MatchResult r = matcher.match(c, job);
        assertThat(r.matchedSkills()).containsExactly("Java", "Spring Boot", "PostgreSQL");
        assertThat(r.missingSkills()).containsExactly("Kafka");
        // coverage 3/4 * 70 + 1.0 * 30 = 82.5 -> 83
        assertThat(r.matchScore()).isEqualTo(83);
    }

    @Test
    void atsScoreIsAdditiveAndPassesAtSixty() {
        Candidate c = new Candidate();
        c.setEmail("a@b.com");
        c.setPhone("+91 90000 10000");
        c.setSkills(List.of("Java", "SQL", "AWS"));
        c.setExperienceYears(3);
        c.setEducation("B.Tech Computer Science");
        c.setRawText("x".repeat(250));

        AtsChecker.AtsResult r = ats.check(c);
        assertThat(r.atsScore()).isEqualTo(100);
        assertThat(r.atsPassed()).isTrue();
        assertThat(r.atsFlags()).isEmpty();
    }
}
