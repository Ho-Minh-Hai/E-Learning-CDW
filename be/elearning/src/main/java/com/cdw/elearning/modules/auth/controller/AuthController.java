package com.cdw.elearning.controller;

import com.cdw.elearning.dto.request.LoginRequest;
import com.cdw.elearning.dto.request.UserCreateRequest;
import com.cdw.elearning.dto.response.ApiResponse;
import com.cdw.elearning.dto.response.LoginResponse;
import com.cdw.elearning.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody UserCreateRequest request) {
        LoginResponse response = authService.register(request);
        return ApiResponse.success("Registration successful", response);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String authorization) {
        String token = authorization.substring(7);
        authService.logout(token);
        return ApiResponse.success("Logout successful", null);
    }
}