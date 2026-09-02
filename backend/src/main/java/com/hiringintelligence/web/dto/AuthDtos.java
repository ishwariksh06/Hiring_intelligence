package com.hiringintelligence.web.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {}

    public record LoginRequest(
            @NotBlank String email,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            UUID id,
            String name,
            String email,
            String role,
            UUID companyId,
            String title,
            String companyName
    ) {}
}
