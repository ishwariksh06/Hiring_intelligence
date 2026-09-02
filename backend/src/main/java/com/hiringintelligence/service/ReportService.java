package com.hiringintelligence.service;

import com.hiringintelligence.domain.Report;
import com.hiringintelligence.repo.ReportRepository;
import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.web.dto.ReportDtos.GenerateReportRequest;
import com.hiringintelligence.web.dto.ReportDtos.ReportResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reports;

    public ReportService(ReportRepository reports) {
        this.reports = reports;
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> list(AppPrincipal principal) {
        List<Report> found = principal.isAdmin()
                ? reports.findAllByOrderByGeneratedAtDesc()
                : reports.findByCompanyIdOrderByGeneratedAtDesc(principal.companyId());
        return found.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReportResponse generate(GenerateReportRequest req, AppPrincipal principal) {
        Report r = new Report();
        String title = req != null && req.title() != null && !req.title().isBlank()
                ? req.title().trim()
                : "Custom Report - " + LocalDate.now();
        r.setTitle(title);
        r.setCompanyId(principal.isAdmin() ? null : principal.companyId());
        return toResponse(reports.save(r));
    }

    private ReportResponse toResponse(Report r) {
        return new ReportResponse(r.getId(), r.getTitle(), r.getGeneratedAt(), "#");
    }
}
