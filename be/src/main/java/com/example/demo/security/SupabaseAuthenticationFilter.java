package com.example.demo.security;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {

    private final SupabaseJwtService jwtService;
    private final UserRepository userRepository;

    public SupabaseAuthenticationFilter(SupabaseJwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    private synchronized void logToFile(String message) {
        try {
            java.io.File file = new java.io.File("d:\\Workspace\\WebPrograming\\WEB_CDW\\APPLICATION\\be\\security.log");
            java.io.FileWriter fw = new java.io.FileWriter(file, true);
            java.io.BufferedWriter bw = new java.io.BufferedWriter(fw);
            bw.write(new java.util.Date() + " - " + message);
            bw.newLine();
            bw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        logToFile("=== doFilterInternal START ===");
        logToFile("Request URI: " + uri);
        
        String authorization = request.getHeader("Authorization");
        if (authorization == null) {
            logToFile("Authorization header is MISSING for URI: " + uri);
        } else if (!authorization.startsWith("Bearer ")) {
            logToFile("Authorization header format is INVALID (does not start with Bearer): " + authorization);
        } else {
            String token = authorization.substring(7);
            logToFile("Token found. Length: " + token.length());
            try {
                JWTClaimsSet claims = jwtService.validateToken(token);
                String subject = claims.getSubject();
                logToFile("Token validated successfully. Subject: " + subject);
                if (subject != null) {
                    UUID userId = UUID.fromString(subject);
                    Optional<User> userOptional = userRepository.findById(userId);
                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        String roleValue = user.getRole();
                        SimpleGrantedAuthority authority = mapRoleToAuthority(roleValue);
                        logToFile("User found in database: " + user.getEmail() + " | DB Role: " + roleValue + " | Mapped Authority: " + authority.getAuthority());
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(authority)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logToFile("Authentication set in SecurityContext for user: " + user.getEmail());
                    } else {
                        logToFile("User NOT found in database repository for subject: " + subject);
                    }
                }
            } catch (Exception ex) {
                logToFile("JWT validation ERROR: " + ex.getMessage());
            }
        }
        logToFile("=== doFilterInternal END ===");

        filterChain.doFilter(request, response);
    }

    private SimpleGrantedAuthority mapRoleToAuthority(String roleValue) {
        switch (roleValue) {
            case "2":
            case "3": // Hỗ trợ tương thích ngược
                return new SimpleGrantedAuthority("ROLE_ADMIN");
            case "1":
            case "0":
            default:
                return new SimpleGrantedAuthority("ROLE_USER");
        }
    }
}
