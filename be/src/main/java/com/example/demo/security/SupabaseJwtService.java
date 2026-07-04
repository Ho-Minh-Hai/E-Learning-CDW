package com.example.demo.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Service
public class SupabaseJwtService {

    private final String jwksUri;
    private final String issuer;
    private final String audience;
    private ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    public SupabaseJwtService(
            @Value("${supabase.auth.jwks-uri}") String jwksUri,
            @Value("${supabase.auth.issuer}") String issuer,
            @Value("${supabase.auth.audience}") String audience) {
        this.jwksUri = jwksUri;
        this.issuer = issuer;
        this.audience = audience;
    }

    @PostConstruct
    public void init() throws MalformedURLException {
        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(jwksUri));
        this.jwtProcessor = new DefaultJWTProcessor<>();
        JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.ES256, keySource);
        this.jwtProcessor.setJWSKeySelector(keySelector);

        JWTClaimsSet expectedClaims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .audience(audience)
                .build();

        Set<String> requiredClaims = new HashSet<>(Arrays.asList("sub", "exp", "aud"));
        this.jwtProcessor.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(expectedClaims, requiredClaims));
    }

    public JWTClaimsSet validateToken(String token) throws ParseException, BadJOSEException, JOSEException {
        SecurityContext ctx = null;
        JWTClaimsSet claims = jwtProcessor.process(token, ctx);

        Date expiration = claims.getExpirationTime();
        if (expiration == null || expiration.before(new Date())) {
            throw new BadJOSEException("Supabase access token has expired.");
        }

        return claims;
    }
}
