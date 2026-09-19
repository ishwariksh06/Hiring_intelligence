package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Job;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** White-box tests: each test targets a specific branch / boundary in the screening code. */
class WhiteBoxBranchTest {

    private final Matcher matcher = new Matcher();
    private final AtsChecker ats = new AtsChecker();
    private final ResumeParser parser = new ResumeParser(new SkillDictionary());

    // ---- Matcher.experienceFit: branch + boundary coverage ----
    @Test void fitAtLowerBoundary() { assertThat(matcher.experienceFit(4, 4, 8)).isEqualTo(1.0); }
    @Test void fitAtUpperBoundary() { assertThat(matcher.experienceFit(8, 4, 8)).isEqualTo(1.0); }
    @Test void fitJustBelowWindowDecays() { assertThat(matcher.experienceFit(3, 4, 8)).isEqualTo(0.75); }
    @Test void fitZeroYearsClampedAtZero() { assertThat(matcher.experienceFit(0, 4, 8)).isEqualTo(0.0); }
    @Test void fitJustAboveWindowDecays() { assertThat(matcher.experienceFit(9, 4, 8)).isEqualTo(0.875); }
    @Test void fitFarAboveClampedAtZero() { assertThat(matcher.experienceFit(40, 4, 8)).isEqualTo(0.0); }
    @Test void fitMaxZeroMeansMinPlusThree() { assertThat(matcher.experienceFit(6, 3, 0)).isEqualTo(1.0); }
    @Test void fitNegativeMinTreatedAsZero() { assertThat(matcher.experienceFit(1, -5, 2)).isEqualTo(1.0); }

    // ---- Matcher.match: null / empty / case branches ----
    @Test
    void matchWithNullSkillListsScoresOnlyExperience() {
        Candidate c = new Candidate();
        c.setSkills(null);
        c.setExperienceYears(5);
        Job j = new Job();
        j.setRequiredSkills(null);
        j.setMinExperience(4);
        j.setMaxExperience(8);
        Matcher.MatchResult r = matcher.match(c, j);
        assertThat(r.matchScore()).isEqualTo(30);
        assertThat(r.matchedSkills()).isEmpty();
    }

    @Test
    void skillMatchIsCaseInsensitive() {
        Candidate c = new Candidate();
        c.setSkills(List.of("java", "SPRING BOOT"));
        c.setExperienceYears(5);
        Job j = new Job();
        j.setRequiredSkills(List.of("Java", "Spring Boot"));
        j.setMinExperience(4);
        j.setMaxExperience(8);
        assertThat(matcher.match(c, j).matchScore()).isEqualTo(100);
    }

    @Test
    void noOverlapProducesNoneFoundExplanation() {
        Candidate c = new Candidate();
        c.setSkills(List.of("Excel"));
        c.setExperienceYears(1);
        Job j = new Job();
        j.setRequiredSkills(List.of("Java"));
        j.setMinExperience(4);
        j.setMaxExperience(8);
        Matcher.MatchResult r = matcher.match(c, j);
        assertThat(r.explanation()).contains("None of the required skills").contains("below the 4 yr minimum");
        assertThat(r.matchScore()).isLessThan(40);
    }

    @Test
    void overExperiencedExplanationMentionsCeiling() {
        Candidate c = new Candidate();
        c.setSkills(List.of("Java"));
        c.setExperienceYears(20);
        Job j = new Job();
        j.setRequiredSkills(List.of("Java"));
        j.setMinExperience(2);
        j.setMaxExperience(5);
        assertThat(matcher.match(c, j).explanation()).contains("above the 5 yr ceiling");
    }

    // ---- AtsChecker: every check toggled individually ----
    private Candidate full() {
        Candidate c = new Candidate();
        c.setEmail("a@b.com");
        c.setPhone("+91 90000 10000");
        c.setSkills(List.of("Java", "SQL", "AWS"));
        c.setExperienceYears(3);
        c.setEducation("B.Tech");
        c.setRawText("x".repeat(250));
        return c;
    }

    @Test void atsMissingEmailCosts20() { Candidate c = full(); c.setEmail(""); assertThat(ats.check(c).atsScore()).isEqualTo(80); }
    @Test void atsMissingPhoneCosts10() { Candidate c = full(); c.setPhone(null); assertThat(ats.check(c).atsScore()).isEqualTo(90); }
    @Test void atsTwoSkillsCosts30() { Candidate c = full(); c.setSkills(List.of("Java", "SQL")); assertThat(ats.check(c).atsScore()).isEqualTo(70); }
    @Test void atsNullSkillsCosts30() { Candidate c = full(); c.setSkills(null); assertThat(ats.check(c).atsScore()).isEqualTo(70); }
    @Test void atsZeroExperienceCosts20() { Candidate c = full(); c.setExperienceYears(0); assertThat(ats.check(c).atsScore()).isEqualTo(80); }
    @Test void atsShortTextCosts10() { Candidate c = full(); c.setRawText("short"); assertThat(ats.check(c).atsScore()).isEqualTo(90); }
    @Test void atsTextExactly200Passes() { Candidate c = full(); c.setRawText("x".repeat(200)); assertThat(ats.check(c).atsScore()).isEqualTo(100); }
    @Test void atsText199Fails() { Candidate c = full(); c.setRawText("x".repeat(199)); assertThat(ats.check(c).atsScore()).isEqualTo(90); }

    @Test
    void atsThresholdIsSixtyInclusive() {
        Candidate c = full();
        c.setEmail("");
        c.setPhone("");
        c.setEducation("");        // 100-20-10-10 = 60
        AtsChecker.AtsResult r = ats.check(c);
        assertThat(r.atsScore()).isEqualTo(60);
        assertThat(r.atsPassed()).isTrue();
        c.setRawText("short");     // 50
        assertThat(ats.check(c).atsPassed()).isFalse();
    }

    @Test
    void atsEmptyCandidateScoresZeroWithSixFlags() {
        AtsChecker.AtsResult r = ats.check(new Candidate());
        assertThat(r.atsScore()).isZero();
        assertThat(r.atsFlags()).hasSize(6);
    }

    // ---- ResumeParser ----
    @Test
    void parserExtractsContactAndSkills() {
        String text = "Priya Sharma\npriya.sharma@example.com | +91 98765 43210\nB.Tech Computer Science\n"
                + "5 years of experience\nSKILLS\nJava, Spring Boot, PostgreSQL";
        ParsedResume p = parser.parse(text, "priya.txt", "Fallback");
        assertThat(p.email()).isEqualTo("priya.sharma@example.com");
        assertThat(p.phone()).contains("98765");
        assertThat(p.skills()).contains("Java", "Spring Boot", "PostgreSQL");
        assertThat(p.experienceYears()).isEqualTo(5);
        assertThat(p.name()).isEqualTo("Priya Sharma");
    }

    @Test
    void parserHandlesEmptyTextWithoutThrowing() {
        ParsedResume p = parser.parse("", "empty.txt", "Fallback Name");
        assertThat(p.skills()).isEmpty();
        assertThat(p.email()).isNullOrEmpty();
    }

    @Test
    void parserDoesNotTreatBadEmailAsEmail() {
        ParsedResume p = parser.parse("John Doe\nnot-an-email@\nJava", "x.txt", "F");
        assertThat(p.email()).isNullOrEmpty();
    }
}
