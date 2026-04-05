package com.example.eircare_backend;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.eircare_backend.model.User.Role;



@Component
public class JWTUtil {

    @Value("${jwt.secret-key}")
    private String secretKey;

    private final long expiration = 1000 * 60 * 60 * 24;

    //TODO: doesnt handle token refreshing yet

    private SecretKey key;
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }
    
    public String createToken(String email, Role role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getTokenRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
            Claims claims = getClaims(token);
            Date tokenExpiration = claims.getExpiration();
            return tokenExpiration.after(new Date());
        } 

    public boolean isRoleValid(String token, Role role) {
        return getTokenRole(token).equals(role.name());
    }
}