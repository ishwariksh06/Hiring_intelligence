package com.hiringintelligence.web;

import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.service.JobService;
import com.hiringintelligence.web.dto.JobDtos.JobCandidateResponse;
import com.hiringintelligence.web.dto.JobDtos.JobRequest;
import com.hiringintelligence.web.dto.JobDtos.JobResponse;
import com.hiringintelligence.web.dto.JobDtos.SetStatusRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<JobResponse> list(@AuthenticationPrincipal AppPrincipal principal) {
        return jobService.list(principal);
    }

    @GetMapping("/{id}")
    public JobResponse get(@PathVariable UUID id, @AuthenticationPrincipal AppPrincipal principal) {
        return jobService.get(id, principal);
    }

    @PostMapping
    public JobResponse create(@Valid @RequestBody JobRequest request,
                              @AuthenticationPrincipal AppPrincipal principal) {
        return jobService.create(request, principal);
    }

    @PutMapping("/{id}")
    public JobResponse update(@PathVariable UUID id, @Valid @RequestBody JobRequest request,
                              @AuthenticationPrincipal AppPrincipal principal) {
        return jobService.update(id, request, principal);
    }

    @GetMapping("/{id}/candidates")
    public List<JobCandidateResponse> ranking(@PathVariable UUID id,
                                              @AuthenticationPrincipal AppPrincipal principal) {
        return jobService.ranking(id, principal);
    }

    @PatchMapping("/{id}/candidates/{candidateId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setStatus(@PathVariable UUID id, @PathVariable UUID candidateId,
                          @Valid @RequestBody SetStatusRequest request,
                          @AuthenticationPrincipal AppPrincipal principal) {
        jobService.setCandidateStatus(id, candidateId, request.status(), principal);
    }
}
