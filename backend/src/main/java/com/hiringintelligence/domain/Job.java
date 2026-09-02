package com.hiringintelligence.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs", indexes = @Index(name = "idx_jobs_company", columnList = "company_id"))
@Getter
@Setter
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 20000)
    private String description;

    @Convert(converter = StringListConverter.class)
    @Column(name = "required_skills", nullable = false, length = 4000)
    private List<String> requiredSkills = new ArrayList<>();

    @Column(nullable = false)
    private int minExperience = 0;

    @Column(nullable = false)
    private int maxExperience = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
