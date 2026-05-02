package com.cdw.elearning.modules.user.service;

import com.cdw.elearning.modules.role.dto.request.RoleAssignRequest;
import com.cdw.elearning.modules.user.dto.request.UserCreateRequest;
import com.cdw.elearning.modules.user.dto.request.UserUpdateRequest;
import com.cdw.elearning.modules.user.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(Long userId, UserUpdateRequest request);

    UserResponse getUserById(Long userId);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getAllUsers();

    void deleteUser(Long userId);

    void assignRoles(RoleAssignRequest request);

    void removeRoles(Long userId, List<Long> roleIds);

    void toggleUserStatus(Long userId);
}