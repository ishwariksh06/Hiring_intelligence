package com.hiringintelligence.repo;

import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByCompanyId(UUID companyId);

    List<Job> findByStatus(JobStatus status);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, JobStatus status);
}
