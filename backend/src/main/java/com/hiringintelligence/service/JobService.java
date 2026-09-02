package com.hiringintelligence.service;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Company;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import com.hiringintelligence.domain.Match;
import com.hiringintelligence.domain.MatchStatus;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import com.hiringintelligence.screening.ScreeningService;
import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.web.ApiExceptions;
import com.hiringintelligence.web.dto.JobDtos.JobCandidateResponse;
import com.hiringintelligence.web.dto.JobDtos.JobRequest;
import com.hiringintelligence.web.dto.JobDtos.JobResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final MatchRepository matches;
    private final CandidateRepository candidates;
    private final ScreeningService screening;

    public JobService(JobRepository jobs, CompanyRepository companies, MatchRepository matches,
                      CandidateRepository candidates, ScreeningService screening) {
        this.jobs = jobs;
        this.companies = companies;
        this.matches = matches;
        this.candidates = candidates;
        this.screening = screening;
    }

    @Transactional(readOnly = true)
    public List<JobResponse> list(AppPrincipal principal) {
        List<Job> found = principal.isAdmin()
                ? jobs.findAll()
                : jobs.findByCompanyId(principal.companyId());
        return found.stream()
                .sorted(Comparator.comparing(Job::getCreatedAt).reversed())
                .map(this::decorate)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse get(UUID id, AppPrincipal principal) {
        return decorate(loadScoped(id, principal));
    }

    @Transactional
    public JobResponse create(JobRequest req, AppPrincipal principal) {
        UUID companyId;
        if (principal.isAdmin()) {
            if (req.companyId() == null) {
                throw new ApiExceptions.BadRequestException("companyId is required");
            }
            companyId = req.companyId();
        } else {
            companyId = principal.companyId();
        }
        if (!companies.existsById(companyId)) {
            throw new ApiExceptions.NotFoundException("Company not found");
        }

        Job job = new Job();
        job.setCompanyId(companyId);
        apply(job, req);
        job = jobs.save(job);
        screening.rescoreJob(job.getId());
        return decorate(reload(job.getId()));
    }

    @Transactional
    public JobResponse update(UUID id, JobRequest req, AppPrincipal principal) {
        Job job = loadScoped(id, principal);
        apply(job, req);
        jobs.save(job);
        screening.rescoreJob(job.getId());
        return decorate(reload(job.getId()));
    }

    @Transactional(readOnly = true)
    public List<JobCandidateResponse> ranking(UUID jobId, AppPrincipal principal) {
        loadScoped(jobId, principal);

        Map<UUID, Candidate> byId = new HashMap<>();
        for (Candidate c : candidates.findAll()) {
            byId.put(c.getId(), c);
        }

        List<JobCandidateResponse> rows = new ArrayList<>();
        for (Match m : matches.findByJobId(jobId)) {
            Candidate c = byId.get(m.getCandidateId());
            rows.add(new JobCandidateResponse(
                    m.getId(),
                    m.getCandidateId(),
                    c != null ? c.getName() : "Unknown",
                    c != null ? c.getEmail() : "",
                    c != null ? c.getExperienceYears() : 0,
                    c != null ? c.getSkills() : List.of(),
                    c != null ? c.getAtsScore() : 0,
                    m.getMatchScore(),
                    m.getMatchedSkills(),
                    m.getMissingSkills(),
                    m.getExplanation(),
                    m.getStatus().name()
            ));
        }
        rows.sort(Comparator.comparingInt(JobCandidateResponse::matchScore).reversed());
        return rows;
    }

    @Transactional
    public void setCandidateStatus(UUID jobId, UUID candidateId, String rawStatus, AppPrincipal principal) {
        loadScoped(jobId, principal);
        MatchStatus status;
        try {
            status = MatchStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiExceptions.BadRequestException("Invalid status: " + rawStatus);
        }
        Match match = matches.findByJobIdAndCandidateId(jobId, candidateId)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Match not found"));
        match.setStatus(status);
        match.setStatusLocked(status != MatchStatus.REVIEW);
        matches.save(match);
    }

    // --- helpers -----------------------------------------------------------

    private Job loadScoped(UUID id, AppPrincipal principal) {
        Job job = jobs.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Job not found"));
        if (!principal.isAdmin() && !job.getCompanyId().equals(principal.companyId())) {
            throw new ApiExceptions.ForbiddenException("This job belongs to another company");
        }
        return job;
    }

    private Job reload(UUID id) {
        return jobs.findById(id).orElseThrow(() -> new ApiExceptions.NotFoundException("Job not found"));
    }

    private void apply(Job job, JobRequest req) {
        job.setTitle(req.title().trim());
        job.setDescription(req.description().trim());
        job.setRequiredSkills(req.requiredSkills() == null ? new ArrayList<>() : new ArrayList<>(req.requiredSkills()));
        job.setMinExperience(req.minExperience() == null ? 0 : req.minExperience());
        job.setMaxExperience(req.maxExperience() == null ? 0 : req.maxExperience());
        if (req.status() != null && !req.status().isBlank()) {
            job.setStatus(JobStatus.valueOf(req.status().trim().toUpperCase()));
        }
    }

    private JobResponse decorate(Job job) {
        String companyName = companies.findById(job.getCompanyId())
                .map(Company::getName).orElse("Unknown company");
        List<Match> jobMatches = matches.findByJobId(job.getId());
        long shortlisted = jobMatches.stream().filter(m -> m.getStatus() == MatchStatus.SHORTLISTED).count();

        return new JobResponse(
                job.getId(),
                job.getCompanyId(),
                companyName,
                job.getTitle(),
                job.getDescription(),
                job.getRequiredSkills(),
                job.getMinExperience(),
                job.getMaxExperience(),
                job.getStatus().name(),
                job.getCreatedAt(),
                jobMatches.size(),
                shortlisted
        );
    }
}
