package com.hiringintelligence.service;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import com.hiringintelligence.domain.Match;
import com.hiringintelligence.domain.MatchStatus;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.web.dto.AnalyticsDtos.DashboardSummary;
import com.hiringintelligence.web.dto.AnalyticsDtos.FunnelStage;
import com.hiringintelligence.web.dto.AnalyticsDtos.RecentJob;
import com.hiringintelligence.web.dto.AnalyticsDtos.SkillCount;
import com.hiringintelligence.web.dto.AnalyticsDtos.SkillGapRow;
import com.hiringintelligence.web.dto.AnalyticsDtos.TrendPoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final JobRepository jobs;
    private final CandidateRepository candidates;
    private final MatchRepository matches;
    private final CompanyRepository companies;

    public AnalyticsService(JobRepository jobs, CandidateRepository candidates,
                            MatchRepository matches, CompanyRepository companies) {
        this.jobs = jobs;
        this.candidates = candidates;
        this.matches = matches;
        this.companies = companies;
    }

    private record Scope(List<Job> jobs, List<Match> matches, List<Candidate> candidatePool, boolean admin) {}

    private Scope scope(AppPrincipal principal) {
        boolean admin = principal.isAdmin();
        List<Job> allJobs = jobs.findAll();
        List<Job> scopedJobs = admin ? allJobs
                : allJobs.stream().filter(j -> j.getCompanyId().equals(principal.companyId())).toList();
        Set<UUID> jobIds = scopedJobs.stream().map(Job::getId).collect(Collectors.toSet());

        List<Match> scopedMatches = matches.findAll().stream()
                .filter(m -> jobIds.contains(m.getJobId()))
                .toList();
        Set<UUID> candidateIds = scopedMatches.stream().map(Match::getCandidateId).collect(Collectors.toSet());

        List<Candidate> pool = admin
                ? candidates.findAll()
                : candidates.findAll().stream().filter(c -> candidateIds.contains(c.getId())).toList();

        return new Scope(scopedJobs, scopedMatches, pool, admin);
    }

    @Transactional(readOnly = true)
    public DashboardSummary dashboardSummary(AppPrincipal principal) {
        Scope s = scope(principal);

        long openJobs = s.jobs().stream().filter(j -> j.getStatus() == JobStatus.OPEN).count();
        long candidatesScreened = s.admin()
                ? candidates.count()
                : s.matches().stream().map(Match::getCandidateId).distinct().count();
        long shortlisted = s.matches().stream().filter(m -> m.getStatus() == MatchStatus.SHORTLISTED).count();
        int avg = s.matches().isEmpty() ? 0
                : (int) Math.round(s.matches().stream().mapToInt(Match::getMatchScore).average().orElse(0));
        Long companyCount = s.admin() ? Long.valueOf(companies.count()) : null;

        Map<UUID, String> companyNames = companies.findAll().stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));

        List<RecentJob> recent = s.jobs().stream()
                .sorted(Comparator.comparing(Job::getCreatedAt).reversed())
                .limit(5)
                .map(j -> new RecentJob(
                        j.getId(),
                        j.getTitle(),
                        companyNames.getOrDefault(j.getCompanyId(), ""),
                        j.getRequiredSkills(),
                        j.getMinExperience(),
                        j.getMaxExperience(),
                        s.matches().stream()
                                .filter(m -> m.getJobId().equals(j.getId()) && m.getStatus() == MatchStatus.SHORTLISTED)
                                .count()
                ))
                .toList();

        return new DashboardSummary(openJobs, candidatesScreened, shortlisted, avg, companyCount, recent);
    }

    @Transactional(readOnly = true)
    public List<SkillCount> skillDemand(AppPrincipal principal) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Candidate c : scope(principal).candidatePool()) {
            for (String skill : c.getSkills()) {
                counts.merge(skill, 1L, Long::sum);
            }
        }
        return counts.entrySet().stream()
                .map(e -> new SkillCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(SkillCount::count).reversed())
                .limit(10)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FunnelStage> screeningFunnel(AppPrincipal principal) {
        Scope s = scope(principal);
        long ingested = s.admin() ? candidates.count() : s.candidatePool().size();
        long matched = s.matches().stream().filter(m -> m.getMatchScore() >= 30).count();
        long strong = s.matches().stream().filter(m -> m.getMatchScore() >= 55).count();
        long shortlisted = s.matches().stream().filter(m -> m.getStatus() == MatchStatus.SHORTLISTED).count();
        long rejected = s.matches().stream().filter(m -> m.getStatus() == MatchStatus.REJECTED).count();
        return List.of(
                new FunnelStage("Ingested", ingested),
                new FunnelStage("Matched", matched),
                new FunnelStage("Strong match", strong),
                new FunnelStage("Shortlisted", shortlisted),
                new FunnelStage("Rejected", rejected)
        );
    }

    @Transactional(readOnly = true)
    public List<SkillGapRow> skillGap(AppPrincipal principal) {
        Scope s = scope(principal);
        Map<String, Long> required = new LinkedHashMap<>();
        for (Job j : s.jobs()) {
            for (String skill : j.getRequiredSkills()) {
                required.merge(skill, 1L, Long::sum);
            }
        }
        Map<String, Long> available = new LinkedHashMap<>();
        for (Candidate c : s.candidatePool()) {
            for (String skill : c.getSkills()) {
                available.merge(skill, 1L, Long::sum);
            }
        }
        return required.entrySet().stream()
                .map(e -> new SkillGapRow(e.getKey(), e.getValue(), available.getOrDefault(e.getKey(), 0L)))
                .sorted(Comparator.comparingLong(SkillGapRow::required).reversed()
                        .thenComparing(SkillGapRow::available))
                .limit(6)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrendPoint> ingestTrend(AppPrincipal principal) {
        Scope s = scope(principal);
        Set<UUID> shortlistedCandidateIds = s.matches().stream()
                .filter(m -> m.getStatus() == MatchStatus.SHORTLISTED)
                .map(Match::getCandidateId)
                .collect(Collectors.toSet());

        // key: year*12 + (month-1)  -> [ingested, shortlisted, label]
        Map<Integer, long[]> buckets = new TreeMap<>();
        Map<Integer, String> labels = new java.util.HashMap<>();

        for (Candidate c : s.candidatePool()) {
            LocalDate d = c.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
            int key = d.getYear() * 12 + (d.getMonthValue() - 1);
            long[] agg = buckets.computeIfAbsent(key, k -> new long[2]);
            agg[0] += 1;
            if (shortlistedCandidateIds.contains(c.getId())) {
                agg[1] += 1;
            }
            labels.putIfAbsent(key, Month.of(d.getMonthValue())
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getYear());
        }

        List<TrendPoint> out = new ArrayList<>();
        for (Map.Entry<Integer, long[]> e : buckets.entrySet()) {
            out.add(new TrendPoint(labels.get(e.getKey()), e.getValue()[0], e.getValue()[1]));
        }
        return out;
    }
}
