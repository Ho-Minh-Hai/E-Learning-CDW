package com.cdw.elearning.service.impl;

import com.cdw.elearning.dto.request.LoginRequest;
import com.cdw.elearning.dto.request.UserCreateRequest;
import com.cdw.elearning.dto.response.LoginResponse;
import com.cdw.elearning.entity.Role;
import com.cdw.elearning.entity.User;
import com.cdw.elearning.exception.AppException;
import com.cdw.elearning.exception.ErrorCode;
import com.cdw.elearning.repository.RoleRepository;
import com.cdw.elearning.repository.UserRepository;
import com.cdw.elearning.security.JwtTokenProvider;
import com.cdw.elearning.service.AuthService;
import com.cdw.elearning.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        String role = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("STUDENT");

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), role);

        log.info("User logged in: {}", user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .build();
    }

    @Override
    @Transactional
    public LoginResponse register(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .avatar(request.getAvatar())
                .isActive(true)
                .isDeleted(false)
                .build();

        Role defaultRole = roleRepository.findByName("STUDENT")
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name("STUDENT")
                            .description("Default student role")
                            .build();
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(defaultRole);
        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), "STUDENT");

        log.info("New user registered: {}", savedUser.getEmail());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role("STUDENT")
                .build();
    }

    @Override
    public void logout(String token) {
        log.info("User logged out");
    }
}