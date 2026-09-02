package com.hiringintelligence.repo;

import com.hiringintelligence.domain.Match;
import com.hiringintelligence.domain.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    List<Match> findByJobId(UUID jobId);

    List<Match> findByCandidateId(UUID candidateId);

    Optional<Match> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    List<Match> findByJobIdIn(List<UUID> jobIds);

    long countByStatus(MatchStatus status);

    @Transactional
    void deleteByJobId(UUID jobId);
}
