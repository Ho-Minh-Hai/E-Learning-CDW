package com.cdw.elearning.modules.auth.service;

import com.cdw.elearning.modules.auth.dto.request.LoginRequest;
import com.cdw.elearning.modules.user.dto.request.UserCreateRequest;
import com.cdw.elearning.modules.auth.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(UserCreateRequest request);

    void logout(String token);
}