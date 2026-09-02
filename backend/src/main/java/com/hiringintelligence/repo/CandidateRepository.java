package com.hiringintelligence.repo;

import com.hiringintelligence.domain.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    List<Candidate> findAllByOrderByCreatedAtDesc();
}
