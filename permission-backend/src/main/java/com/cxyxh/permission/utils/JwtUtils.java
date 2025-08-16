package com.cxyxh.permission.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.cxyxh.permission.security.userdetail.SecurityUser;
import com.cxyxh.permission.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private Long tokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;


    public String generateToken(SecurityUser user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getUserId());
        claims.put("username", user.getUsername());
        return JWT.create()
                .withClaim("claims", claims)
                .withSubject(user.getUsername())
                .withIssuedAt(Date.from(Instant.now()))
                .withExpiresAt(new Date(System.currentTimeMillis() + tokenExpiration * 1000))
                .sign(Algorithm.HMAC512(secret));
    }

    public Boolean verifyToken(String token) {
        DecodedJWT verify = JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
        Claim claim = verify.getClaim("claims");
        Map<String, Object> map = claim.asMap();
        String username = map.get("username").toString();
        String subject = verify.getSubject();
        return username.equals(subject) && !isTokenExpired(token);
    }


    public String refreshToken(String token) {
        return null;
    }

    public String getUsernameFromToken(String token) {
        DecodedJWT verify = JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
        return verify.getSubject();
    }

    public String getUserIdFromToken(String token) {
        Claim claimsFromToken = getClaimsFromToken(token);
        Map<String, Object> map = claimsFromToken.asMap();
        return map.get("userid").toString();
    }

    public Claim getClaimsFromToken(String token) {
        DecodedJWT verify = JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
        return verify.getClaim("claims");
    }

    public Boolean isTokenExpired(String token) {
        DecodedJWT verify = JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
        return verify.getExpiresAt().before(new Date());
    }


}
