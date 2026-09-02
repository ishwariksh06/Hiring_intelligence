package com.hiringintelligence.security;

import com.hiringintelligence.config.AppProperties;
import com.hiringintelligence.domain.Role;
import com.hiringintelligence.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMillis;

    public JwtService(AppProperties props) {
        byte[] secret = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            // HS256 needs >= 256 bits; pad deterministically so dev config still boots.
            byte[] padded = new byte[32];
            System.arraycopy(secret, 0, padded, 0, secret.length);
            for (int i = secret.length; i < 32; i++) {
                padded[i] = (byte) ('x' + i);
            }
            secret = padded;
        }
        this.key = Keys.hmacShaKeyFor(secret);
        this.expirationMillis = props.getJwt().getExpiration().toMillis();
    }

    public String issue(User user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMillis);
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .claim("companyId", user.getCompanyId() == null ? null : user.getCompanyId().toString())
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public AppPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        UUID userId = UUID.fromString(claims.getSubject());
        Role role = Role.valueOf(claims.get("role", String.class));
        String email = claims.get("email", String.class);
        String companyId = claims.get("companyId", String.class);
        return new AppPrincipal(userId, email, role,
                companyId == null ? null : UUID.fromString(companyId));
    }
}
