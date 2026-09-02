package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import com.hiringintelligence.domain.Match;
import com.hiringintelligence.domain.MatchStatus;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Recomputes the {@code matches} table. Port of {@code rescoreJob} / {@code decideShortlist}
 * in the frontend {@code src/db/queries.js}.
 *
 * <p>Re-score triggers: create/update a job re-scores that job; ingesting resumes
 * re-scores every OPEN job. A recruiter's manual SHORTLISTED/REJECTED decision sets
 * {@code statusLocked} so re-scoring does not overwrite it.</p>
 */
@Service
public class ScreeningService {

    private static final int MIN_SHORTLIST_SCORE = 55;
    private static final int MAX_SHORTLIST = 10;

    private final JobRepository jobs;
    private final CandidateRepository candidates;
    private final MatchRepository matches;
    private final Matcher matcher;

    public ScreeningService(JobRepository jobs, CandidateRepository candidates,
                            MatchRepository matches, Matcher matcher) {
        this.jobs = jobs;
        this.candidates = candidates;
        this.matches = matches;
        this.matcher = matcher;
    }

    @Transactional
    public void rescoreJob(UUID jobId) {
        Job job = jobs.findById(jobId).orElse(null);
        if (job == null) {
            return;
        }

        Map<UUID, Match> existingByCandidate = new HashMap<>();
        for (Match m : matches.findByJobId(jobId)) {
            existingByCandidate.put(m.getCandidateId(), m);
        }

        List<Candidate> pool = candidates.findAll();
        List<Match> scored = new ArrayList<>(pool.size());
        for (Candidate cand : pool) {
            Match prev = existingByCandidate.get(cand.getId());
            Matcher.MatchResult r = matcher.match(cand, job);

            Match m = new Match();
            m.setJobId(jobId);
            m.setCandidateId(cand.getId());
            m.setMatchScore(r.matchScore());
            m.setMatchedSkills(new ArrayList<>(r.matchedSkills()));
            m.setMissingSkills(new ArrayList<>(r.missingSkills()));
            m.setExplanation(r.explanation());
            if (prev != null) {
                m.setCreatedAt(prev.getCreatedAt());
            }
            // carry the prior decision so decideShortlist can preserve locked rows
            m.setStatus(prev != null ? prev.getStatus() : MatchStatus.REVIEW);
            m.setStatusLocked(prev != null && prev.isStatusLocked());
            scored.add(m);
        }

        decideShortlist(scored);

        matches.deleteByJobId(jobId);
        matches.flush();
        matches.saveAll(scored);
    }

    @Transactional
    public void rescoreAllOpenJobs() {
        for (Job job : jobs.findByStatus(JobStatus.OPEN)) {
            rescoreJob(job.getId());
        }
    }

    /**
     * Ranks a job's matches by score, assigns a rank, and sets SHORTLISTED for the
     * top {@value #MAX_SHORTLIST} scoring at least {@value #MIN_SHORTLIST_SCORE}.
     * Rows with {@code statusLocked} keep their existing status.
     */
    private void decideShortlist(List<Match> jobMatches) {
        jobMatches.sort(Comparator.comparingInt(Match::getMatchScore).reversed());
        for (int i = 0; i < jobMatches.size(); i++) {
            Match m = jobMatches.get(i);
            m.setRank(i + 1);
            if (m.isStatusLocked()) {
                continue;
            }
            boolean shortlisted = m.getMatchScore() >= MIN_SHORTLIST_SCORE && i < MAX_SHORTLIST;
            m.setStatus(shortlisted ? MatchStatus.SHORTLISTED : MatchStatus.REVIEW);
        }
    }
}
