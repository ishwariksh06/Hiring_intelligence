package com.hiringintelligence.service;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.screening.InterviewQuestions;
import com.hiringintelligence.security.LoginRateLimiter;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/** Unit tests for the login throttle, the read cache and interview question generation. */
class FixesUnitTest {

    // ---- LoginRateLimiter ----
    @Test
    void allowsUpToFiveFailuresThenBlocks() {
        LoginRateLimiter l = new LoginRateLimiter();
        for (int i = 0; i < LoginRateLimiter.MAX_FAILURES; i++) {
            assertThat(l.retryAfterSeconds("1.1.1.1", "a@b.com")).isZero();
            l.recordFailure("1.1.1.1", "a@b.com");
        }
        assertThat(l.retryAfterSeconds("1.1.1.1", "a@b.com")).isPositive();
    }

    @Test
    void fourFailuresAreStillAllowed() {
        LoginRateLimiter l = new LoginRateLimiter();
        for (int i = 0; i < LoginRateLimiter.MAX_FAILURES - 1; i++) {
            l.recordFailure("1.1.1.1", "a@b.com");
        }
        assertThat(l.retryAfterSeconds("1.1.1.1", "a@b.com")).isZero();
    }

    @Test
    void successResetsTheCounter() {
        LoginRateLimiter l = new LoginRateLimiter();
        for (int i = 0; i < LoginRateLimiter.MAX_FAILURES; i++) {
            l.recordFailure("1.1.1.1", "a@b.com");
        }
        l.recordSuccess("1.1.1.1", "a@b.com");
        assertThat(l.retryAfterSeconds("1.1.1.1", "a@b.com")).isZero();
    }

    @Test
    void differentClientOrEmailIsNotBlocked() {
        LoginRateLimiter l = new LoginRateLimiter();
        for (int i = 0; i < LoginRateLimiter.MAX_FAILURES; i++) {
            l.recordFailure("1.1.1.1", "a@b.com");
        }
        assertThat(l.retryAfterSeconds("2.2.2.2", "a@b.com")).isZero();
        assertThat(l.retryAfterSeconds("1.1.1.1", "other@b.com")).isZero();
    }

    @Test
    void emailComparisonIgnoresCaseAndSpaces() {
        LoginRateLimiter l = new LoginRateLimiter();
        for (int i = 0; i < LoginRateLimiter.MAX_FAILURES; i++) {
            l.recordFailure("1.1.1.1", " A@B.com ");
        }
        assertThat(l.retryAfterSeconds("1.1.1.1", "a@b.com")).isPositive();
    }

    @Test
    void nullEmailDoesNotThrow() {
        LoginRateLimiter l = new LoginRateLimiter();
        l.recordFailure("1.1.1.1", null);
        assertThat(l.retryAfterSeconds("1.1.1.1", null)).isZero();
    }

    // ---- ReadCache ----
    @Test
    void cacheLoadsOnceThenServesFromCache() {
        ReadCache c = new ReadCache();
        AtomicInteger loads = new AtomicInteger();
        assertThat(c.<Integer>get("k", loads::incrementAndGet)).isEqualTo(1);
        assertThat(c.<Integer>get("k", loads::incrementAndGet)).isEqualTo(1);
        assertThat(loads.get()).isEqualTo(1);
    }

    @Test
    void clearForcesReload() {
        ReadCache c = new ReadCache();
        AtomicInteger loads = new AtomicInteger();
        c.<Integer>get("k", loads::incrementAndGet);
        c.clear();
        assertThat(c.<Integer>get("k", loads::incrementAndGet)).isEqualTo(2);
    }

    @Test
    void differentKeysAreIndependent() {
        ReadCache c = new ReadCache();
        assertThat(c.<String>get("a", () -> "A")).isEqualTo("A");
        assertThat(c.<String>get("b", () -> "B")).isEqualTo("B");
    }

    // ---- InterviewQuestions ----
    private Candidate cand(int years, String... skills) {
        Candidate c = new Candidate();
        c.setSkills(List.of(skills));
        c.setExperienceYears(years);
        return c;
    }

    @Test
    void questionsIncludeSkillTemplatesAndTwoGenericOnes() {
        List<String> q = new InterviewQuestions().generate(cand(4, "Java", "Docker"));
        assertThat(q).hasSize(4);
        assertThat(q.get(0)).contains("JVM");
        assertThat(q.get(1)).contains("images");
        assertThat(q.get(3)).contains("4 years");
    }

    @Test
    void unknownSkillsOnlyGiveGenericQuestions() {
        List<String> q = new InterviewQuestions().generate(cand(2, "Basket weaving"));
        assertThat(q).hasSize(2);
    }

    @Test
    void nullSkillsAreHandled() {
        Candidate c = new Candidate();
        c.setSkills(null);
        assertThat(new InterviewQuestions().generate(c)).hasSize(2);
    }

    @Test
    void neverMoreThanSixQuestions() {
        List<String> q = new InterviewQuestions().generate(
                cand(9, "Java", "Spring Boot", "Microservices", "React", "Node.js", "AWS", "Kubernetes", "SQL"));
        assertThat(q).hasSize(6);
    }

    @Test
    void duplicateSkillsDoNotRepeatAQuestion() {
        List<String> q = new InterviewQuestions().generate(cand(3, "Java", "Java"));
        assertThat(q.stream().filter(s -> s.contains("JVM")).count()).isEqualTo(1);
    }
}
