package com.hiringintelligence.web;

import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.service.CandidateService;
import com.hiringintelligence.web.dto.CandidateDtos.CandidateDetailResponse;
import com.hiringintelligence.web.dto.CandidateDtos.CandidatePoolResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CandidatePoolResponse> list(@AuthenticationPrincipal AppPrincipal principal) {
        return candidateService.list(principal);
    }

    @GetMapping("/{id}")
    public CandidateDetailResponse get(@PathVariable UUID id,
                                       @AuthenticationPrincipal AppPrincipal principal) {
        return candidateService.get(id, principal);
    }
}
