package com.hiringintelligence.web;

import com.hiringintelligence.service.ReadCache;
import com.hiringintelligence.service.CompanyService;
import com.hiringintelligence.web.dto.CompanyDtos.CompanyResponse;
import com.hiringintelligence.web.dto.CompanyDtos.CreateCompanyRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@PreAuthorize("hasRole('ADMIN')")
public class CompanyController {

    private final CompanyService companyService;
    private final ReadCache cache;

    public CompanyController(CompanyService companyService, ReadCache cache) {
        this.companyService = companyService;
        this.cache = cache;
    }

    @GetMapping
    public List<CompanyResponse> list() {
        return cache.get("companies", companyService::list);
    }

    @GetMapping("/{id}")
    public CompanyResponse get(@PathVariable UUID id) {
        return companyService.get(id);
    }

    @PostMapping
    public CompanyResponse create(@Valid @RequestBody CreateCompanyRequest request) {
        CompanyResponse created = companyService.create(request);
        cache.clear();
        return created;
    }
}
