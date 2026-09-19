package com.hiringintelligence.security;

import com.hiringintelligence.config.AppProperties;
import com.hiringintelligence.domain.Role;
import com.hiringintelligence.domain.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** White-box tests of token issue/parse: happy path, tamper, expiry, wrong key. */
class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-0123456789abcdef0123456789abcdef";

    private JwtService service(String secret, Duration ttl) {
        AppProperties p = new AppProperties();
        AppProperties.Jwt jwt = new AppProperties.Jwt();
        jwt.setSecret(secret);
        jwt.setExpiration(ttl);
        p.setJwt(jwt);
        return new JwtService(p);
    }

    private User user(Role role, UUID companyId) {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setEmail("t@example.com");
        u.setRole(role);
        u.setCompanyId(companyId);
        return u;
    }

    @Test
    void roundTripPreservesClaims() {
        UUID company = UUID.randomUUID();
        JwtService s = service(SECRET, Duration.ofHours(1));
        User u = user(Role.RECRUITER, company);
        AppPrincipal p = s.parse(s.issue(u));
        assertThat(p.userId()).isEqualTo(u.getId());
        assertThat(p.role()).isEqualTo(Role.RECRUITER);
        assertThat(p.companyId()).isEqualTo(company);
    }

    @Test
    void adminHasNullCompany() {
        JwtService s = service(SECRET, Duration.ofHours(1));
        assertThat(s.parse(s.issue(user(Role.ADMIN, null))).companyId()).isNull();
    }

    @Test
    void tamperedTokenRejected() {
        JwtService s = service(SECRET, Duration.ofHours(1));
        String t = s.issue(user(Role.ADMIN, null));
        String tampered = t.substring(0, t.length() - 3) + (t.endsWith("AAA") ? "BBB" : "AAA");
        assertThatThrownBy(() -> s.parse(tampered)).isInstanceOf(JwtException.class);
    }

    @Test
    void expiredTokenRejected() {
        JwtService s = service(SECRET, Duration.ofMillis(-1000));
        String t = s.issue(user(Role.ADMIN, null));
        assertThatThrownBy(() -> s.parse(t)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenSignedWithOtherKeyRejected() {
        String t = service(SECRET, Duration.ofHours(1)).issue(user(Role.ADMIN, null));
        JwtService other = service("another-secret-9876543210fedcba9876543210fedcba", Duration.ofHours(1));
        assertThatThrownBy(() -> other.parse(t)).isInstanceOf(JwtException.class);
    }

    @Test
    void garbageTokenRejected() {
        JwtService s = service(SECRET, Duration.ofHours(1));
        assertThatThrownBy(() -> s.parse("not.a.jwt")).isInstanceOf(RuntimeException.class);
    }
}
