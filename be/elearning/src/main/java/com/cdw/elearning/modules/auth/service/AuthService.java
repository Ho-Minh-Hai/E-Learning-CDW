package com.cdw.elearning.service;

import com.cdw.elearning.dto.request.LoginRequest;
import com.cdw.elearning.dto.request.UserCreateRequest;
import com.cdw.elearning.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(UserCreateRequest request);

    void logout(String token);
}