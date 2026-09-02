package com.hiringintelligence.service;

import com.hiringintelligence.domain.Company;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import com.hiringintelligence.domain.Match;
import com.hiringintelligence.domain.MatchStatus;
import com.hiringintelligence.domain.Role;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import com.hiringintelligence.repo.UserRepository;
import com.hiringintelligence.web.ApiExceptions;
import com.hiringintelligence.web.dto.CompanyDtos.CompanyResponse;
import com.hiringintelligence.web.dto.CompanyDtos.CreateCompanyRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companies;
    private final JobRepository jobs;
    private final MatchRepository matches;
    private final UserRepository users;

    public CompanyService(CompanyRepository companies, JobRepository jobs,
                          MatchRepository matches, UserRepository users) {
        this.companies = companies;
        this.jobs = jobs;
        this.matches = matches;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> list() {
        return companies.findAllByOrderByNameAsc().stream().map(this::decorate).toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(UUID id) {
        Company c = companies.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFoundException("Company not found"));
        return decorate(c);
    }

    @Transactional
    public CompanyResponse create(CreateCompanyRequest req) {
        Company c = new Company();
        c.setName(req.name().trim());
        c.setIndustry(orEmpty(req.industry()));
        c.setLocation(orEmpty(req.location()));
        c.setContactName(orEmpty(req.contactName()));
        c.setContactEmail(orEmpty(req.contactEmail()));
        return decorate(companies.save(c));
    }

    private CompanyResponse decorate(Company company) {
        List<Job> companyJobs = jobs.findByCompanyId(company.getId());
        Set<UUID> jobIds = companyJobs.stream().map(Job::getId).collect(Collectors.toSet());

        long openJobs = companyJobs.stream().filter(j -> j.getStatus() == JobStatus.OPEN).count();
        long shortlisted = jobIds.isEmpty() ? 0 : matches.findByJobIdIn(List.copyOf(jobIds)).stream()
                .filter(m -> m.getStatus() == MatchStatus.SHORTLISTED)
                .count();

        String recruiterEmail = users.findByCompanyIdAndRole(company.getId(), Role.RECRUITER).stream()
                .findFirst()
                .map(u -> u.getEmail())
                .orElse(null);

        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getIndustry(),
                company.getLocation(),
                company.getContactName(),
                company.getContactEmail(),
                company.getCreatedAt(),
                openJobs,
                jobIds.size(),
                shortlisted,
                recruiterEmail
        );
    }

    private static String orEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}
