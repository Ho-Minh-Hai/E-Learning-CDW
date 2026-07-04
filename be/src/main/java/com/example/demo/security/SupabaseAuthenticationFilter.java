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

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                JWTClaimsSet claims = jwtService.validateToken(token);
                String subject = claims.getSubject();
                if (subject != null) {
                    UUID userId = UUID.fromString(subject);
                    Optional<User> userOptional = userRepository.findById(userId);
                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        String roleValue = user.getRole();
                        SimpleGrantedAuthority authority = mapRoleToAuthority(roleValue);
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(authority)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        System.out.println("User not found: " + subject);
                    }
                }
            } catch (Exception ex) {
                System.out.println("JWT ERROR: " + ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private SimpleGrantedAuthority mapRoleToAuthority(String roleValue) {
        switch (roleValue) {
            case "2":
                return new SimpleGrantedAuthority("ROLE_ADMIN");
            case "1":
            case "0":
            default:
                return new SimpleGrantedAuthority("ROLE_USER");
        }
    }
}
