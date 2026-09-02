package com.hiringintelligence.repo;

import com.hiringintelligence.domain.Role;
import com.hiringintelligence.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByCompanyIdAndRole(UUID companyId, Role role);
}
