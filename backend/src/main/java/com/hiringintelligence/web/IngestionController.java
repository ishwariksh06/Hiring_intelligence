package com.hiringintelligence.web;

import com.hiringintelligence.service.IngestionService;
import com.hiringintelligence.web.dto.CandidateDtos.IngestJsonEntry;
import com.hiringintelligence.web.dto.CandidateDtos.IngestedCandidateResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@PreAuthorize("hasRole('ADMIN')")
public class IngestionController {

    private final IngestionService ingestionService;

    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public List<IngestedCandidateResponse> ingestJson(@RequestBody List<IngestJsonEntry> entries) {
        return ingestionService.ingestJson(entries);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<IngestedCandidateResponse> ingestFiles(@RequestParam("files") MultipartFile[] files) {
        return ingestionService.ingestFiles(files);
    }
}
