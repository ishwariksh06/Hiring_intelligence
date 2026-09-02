package com.hiringintelligence.security;

import com.hiringintelligence.domain.Role;

import java.util.UUID;

/**
 * The authenticated principal, reconstructed from JWT claims on every request.
 * Available in controllers via {@code @AuthenticationPrincipal AppPrincipal}.
 */
public record AppPrincipal(UUID userId, String email, Role role, UUID companyId) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
