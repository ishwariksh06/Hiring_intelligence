package com.hiringintelligence.service;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Company;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.Match;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import com.hiringintelligence.screening.InterviewQuestions;
import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.web.ApiExceptions;
import com.hiringintelligence.web.dto.CandidateDtos.CandidateDetailResponse;
import com.hiringintelligence.web.dto.CandidateDtos.CandidateMatchView;
import com.hiringintelligence.web.dto.CandidateDtos.CandidatePoolResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private static final int VISIBILITY_THRESHOLD = 30;

    private final CandidateRepository candidates;
    private final MatchRepository matches;
    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final InterviewQuestions interviewQuestions;

    public CandidateService(CandidateRepository candidates, MatchRepository matches, JobRepository jobs,
                            CompanyRepository companies, InterviewQuestions interviewQuestions) {
        this.candidates = candidates;
        this.matches = matches;
        this.jobs = jobs;
        this.companies = companies;
        this.interviewQuestions = interviewQuestions;
    }

    @Transactional(readOnly = true)
    public List<CandidatePoolResponse> list(AppPrincipal principal) {
        List<Match> allMatches = matches.findAll();

        if (principal.isAdmin()) {
            Map<UUID, List<Match>> byCandidate = allMatches.stream()
                    .collect(Collectors.groupingBy(Match::getCandidateId));
            return candidates.findAllByOrderByCreatedAtDesc().stream()
                    .map(c -> toPoolRow(c, byCandidate.getOrDefault(c.getId(), List.of())))
                    .toList();
        }

        Set<UUID> jobIds = jobs.findByCompanyId(principal.companyId()).stream()
                .map(Job::getId).collect(Collectors.toSet());
        Map<UUID, List<Match>> byCandidate = allMatches.stream()
                .filter(m -> jobIds.contains(m.getJobId()))
                .collect(Collectors.groupingBy(Match::getCandidateId));

        Set<UUID> visibleIds = byCandidate.entrySet().stream()
                .filter(e -> e.getValue().stream().anyMatch(m -> m.getMatchScore() >= VISIBILITY_THRESHOLD))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        return candidates.findAll().stream()
                .filter(c -> visibleIds.contains(c.getId()))
                .map(c -> toPoolRow(c, byCandidate.getOrDefault(c.getId(), List.of())))
                .sorted(Comparator.comparingInt((CandidatePoolResponse r) ->
                        r.bestMatchScore() == null ? 0 : r.bestMatchScore()).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public CandidateDetailResponse get(UUID id, AppPrincipal principal) {
        Candidate c = candidates.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Candidate not found"));

        Set<UUID> visibleJobIds = null;
        if (!principal.isAdmin()) {
            visibleJobIds = jobs.findByCompanyId(principal.companyId()).stream()
                    .map(Job::getId).collect(Collectors.toSet());
        }

        List<Match> rawMatches = new ArrayList<>(matches.findByCandidateId(id));
        if (visibleJobIds != null) {
            Set<UUID> visible = visibleJobIds;
            rawMatches.removeIf(m -> !visible.contains(m.getJobId()));
            boolean surfaced = rawMatches.stream().anyMatch(m -> m.getMatchScore() >= VISIBILITY_THRESHOLD);
            if (!surfaced) {
                throw new ApiExceptions.NotFoundException("Candidate not found");
            }
        }

        Map<UUID, Job> jobById = new HashMap<>();
        jobs.findAllById(rawMatches.stream().map(Match::getJobId).toList())
                .forEach(j -> jobById.put(j.getId(), j));
        Map<UUID, String> companyNames = new HashMap<>();
        companies.findAll().forEach(co -> companyNames.put(co.getId(), co.getName()));

        List<CandidateMatchView> matchViews = rawMatches.stream()
                .sorted(Comparator.comparingInt(Match::getMatchScore).reversed())
                .map(m -> {
                    Job j = jobById.get(m.getJobId());
                    return new CandidateMatchView(
                            m.getId(),
                            m.getJobId(),
                            m.getCandidateId(),
                            m.getMatchScore(),
                            m.getMatchedSkills(),
                            m.getMissingSkills(),
                            m.getExplanation(),
                            m.getRank(),
                            m.getStatus().name(),
                            m.isStatusLocked(),
                            m.getCreatedAt(),
                            j != null ? j.getTitle() : "Removed job",
                            j != null ? companyNames.getOrDefault(j.getCompanyId(), "") : ""
                    );
                })
                .toList();

        return new CandidateDetailResponse(
                c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getSkills(),
                c.getExperienceYears(), c.getEducation(), c.getResumeSummary(), c.getRawText(),
                c.getSourceFile(), c.getCategory(), c.getAtsScore(), c.getAtsFlags(), c.getCreatedAt(),
                matchViews, interviewQuestions.generate(c)
        );
    }

    private CandidatePoolResponse toPoolRow(Candidate c, List<Match> candidateMatches) {
        Integer best = candidateMatches.stream()
                .map(Match::getMatchScore)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return new CandidatePoolResponse(
                c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getSkills(),
                c.getExperienceYears(), c.getEducation(), c.getResumeSummary(), c.getSourceFile(),
                c.getCategory(), c.getAtsScore(), c.getAtsFlags(), c.getCreatedAt(),
                candidateMatches.size(), best
        );
    }
}
