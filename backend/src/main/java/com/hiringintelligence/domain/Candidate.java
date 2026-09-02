package com.hiringintelligence.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "candidates")
@Getter
@Setter
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;

    @Convert(converter = StringListConverter.class)
    @Column(nullable = false, length = 4000)
    private List<String> skills = new ArrayList<>();

    @Column(nullable = false)
    private int experienceYears = 0;

    private String education;

    @Column(length = 2000)
    private String resumeSummary;

    @Column(length = 40000)
    private String rawText;

    private String sourceFile;
    private String category;

    @Column(nullable = false)
    private int atsScore = 0;

    @Convert(converter = StringListConverter.class)
    @Column(nullable = false, length = 4000)
    private List<String> atsFlags = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
