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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "matches",
        uniqueConstraints = @UniqueConstraint(name = "uq_match_job_candidate", columnNames = {"job_id", "candidate_id"}),
        indexes = {
                @Index(name = "idx_matches_job", columnList = "job_id"),
                @Index(name = "idx_matches_candidate", columnList = "candidate_id")
        }
)
@Getter
@Setter
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(nullable = false)
    private int matchScore;

    @Convert(converter = StringListConverter.class)
    @Column(nullable = false, length = 4000)
    private List<String> matchedSkills = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(nullable = false, length = 4000)
    private List<String> missingSkills = new ArrayList<>();

    @Column(length = 2000)
    private String explanation;

    private Integer rank;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.REVIEW;

    /** Set when a recruiter manually overrides the status; re-scoring preserves it. */
    @Column(nullable = false)
    private boolean statusLocked = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
