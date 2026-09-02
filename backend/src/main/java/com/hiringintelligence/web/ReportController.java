package com.hiringintelligence.web;

import com.hiringintelligence.security.AppPrincipal;
import com.hiringintelligence.service.ReportService;
import com.hiringintelligence.web.dto.ReportDtos.GenerateReportRequest;
import com.hiringintelligence.web.dto.ReportDtos.ReportResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public List<ReportResponse> list(@AuthenticationPrincipal AppPrincipal principal) {
        return reportService.list(principal);
    }

    @PostMapping("/generate")
    public Map<String, Object> generate(@RequestBody(required = false) GenerateReportRequest request,
                                        @AuthenticationPrincipal AppPrincipal principal) {
        ReportResponse report = reportService.generate(request, principal);
        return Map.of("reportUrl", report.reportUrl(), "report", report);
    }
}
