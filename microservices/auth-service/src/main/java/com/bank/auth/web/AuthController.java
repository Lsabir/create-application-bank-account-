package com.bank.auth.web;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String SECRET = "super-secret-key-change-me-super-secret-key-change-me";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> token(@RequestBody Map<String, String> body) {
        String subject = body.getOrDefault("username", "user");
        Instant now = Instant.now();
        String jwt = Jwts.builder()
            .setSubject(subject)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plusSeconds(3600)))
            .signWith(KEY, SignatureAlgorithm.HS256)
            .compact();
        return ResponseEntity.ok(Map.of("access_token", jwt, "token_type", "Bearer"));
    }
}






