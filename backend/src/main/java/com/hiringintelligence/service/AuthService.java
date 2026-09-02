package com.hiringintelligence.service;

import com.hiringintelligence.domain.Company;
import com.hiringintelligence.domain.User;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.UserRepository;
import com.hiringintelligence.security.JwtService;
import com.hiringintelligence.web.ApiExceptions;
import com.hiringintelligence.web.dto.AuthDtos.LoginRequest;
import com.hiringintelligence.web.dto.AuthDtos.LoginResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final CompanyRepository companies;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, CompanyRepository companies,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.companies = companies;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest req) {
        User user = users.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiExceptions.UnauthorizedException("Invalid email or password"));

        String companyName = null;
        if (user.getCompanyId() != null) {
            companyName = companies.findById(user.getCompanyId()).map(Company::getName).orElse(null);
        }

        String token = jwtService.issue(user);
        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCompanyId(),
                user.getTitle() == null ? "" : user.getTitle(),
                companyName
        );
    }
}
